package services

import (
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
	"github.com/ham-zettt/zen-habits/utils"
)

// RegisterRequest is the payload for creating an account.
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=120"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

// LoginRequest is the payload for signing in.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthService owns account creation, login, and token lifecycle.
type AuthService struct {
	users  *repositories.UserRepository
	tokens *repositories.RefreshTokenRepository
	cfg    *config.Config
}

// NewAuthService builds an AuthService.
func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		users:  repositories.NewUserRepository(db),
		tokens: repositories.NewRefreshTokenRepository(db),
		cfg:    cfg,
	}
}

// Register creates a new user, rejecting duplicate emails.
func (s *AuthService) Register(req RegisterRequest) (*models.User, error) {
	email := normalizeEmail(req.Email)

	exists, err := s.users.EmailExists(email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailTaken
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:         strings.TrimSpace(req.Name),
		Email:        email,
		PasswordHash: hash,
	}
	if err := s.users.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Login verifies credentials and returns the matching user.
func (s *AuthService) Login(req LoginRequest) (*models.User, error) {
	user, err := s.users.FindByEmail(normalizeEmail(req.Email))
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		return nil, ErrInvalidCredentials
	}
	return user, nil
}

// IssueTokens signs an access/refresh pair and persists the refresh hash.
func (s *AuthService) IssueTokens(user *models.User) (string, string, error) {
	access, err := utils.GenerateToken(s.cfg.JWTSecret, user.ID.String(), utils.TokenTypeAccess, s.cfg.AccessTTL)
	if err != nil {
		return "", "", err
	}

	refresh, err := utils.GenerateToken(s.cfg.JWTSecret, user.ID.String(), utils.TokenTypeRefresh, s.cfg.RefreshTTL)
	if err != nil {
		return "", "", err
	}

	record := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: utils.HashToken(refresh),
		ExpiresAt: time.Now().Add(s.cfg.RefreshTTL),
	}
	if err := s.tokens.Create(record); err != nil {
		return "", "", err
	}

	return access, refresh, nil
}

// Refresh validates and rotates a refresh token, returning a new pair.
func (s *AuthService) Refresh(refreshToken string) (*models.User, string, string, error) {
	claims, err := utils.ParseToken(s.cfg.JWTSecret, refreshToken, utils.TokenTypeRefresh)
	if err != nil {
		return nil, "", "", ErrInvalidToken
	}

	record, err := s.tokens.FindActiveByHash(utils.HashToken(refreshToken))
	if err != nil || time.Now().After(record.ExpiresAt) {
		return nil, "", "", ErrInvalidToken
	}

	record.Revoked = true
	if err := s.tokens.Save(record); err != nil {
		return nil, "", "", err
	}

	user, err := s.users.FindByID(claims.UserID)
	if err != nil {
		return nil, "", "", ErrInvalidToken
	}

	access, newRefresh, err := s.IssueTokens(user)
	if err != nil {
		return nil, "", "", err
	}
	return user, access, newRefresh, nil
}

// Logout revokes the presented refresh token. A missing token is a no-op.
func (s *AuthService) Logout(refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	return s.tokens.RevokeByHash(utils.HashToken(refreshToken))
}

// GetUser loads a user by ID.
func (s *AuthService) GetUser(id string) (*models.User, error) {
	user, err := s.users.FindByID(id)
	if err != nil {
		return nil, ErrNotFound
	}
	return user, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
