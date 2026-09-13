package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// RefreshTokenRepository handles refresh-token persistence.
type RefreshTokenRepository struct {
	db *gorm.DB
}

// NewRefreshTokenRepository builds a RefreshTokenRepository.
func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

// Create inserts a refresh token record.
func (r *RefreshTokenRepository) Create(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

// FindActiveByHash returns a non-revoked token by its hash.
func (r *RefreshTokenRepository) FindActiveByHash(hash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	if err := r.db.Where("token_hash = ? AND revoked = ?", hash, false).First(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

// Save updates a refresh token record.
func (r *RefreshTokenRepository) Save(token *models.RefreshToken) error {
	return r.db.Save(token).Error
}

// RevokeByHash marks the token with the given hash as revoked.
func (r *RefreshTokenRepository) RevokeByHash(hash string) error {
	return r.db.Model(&models.RefreshToken{}).
		Where("token_hash = ?", hash).
		Update("revoked", true).Error
}
