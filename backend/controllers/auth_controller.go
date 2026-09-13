package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// Cookie names and the refresh cookie path. The refresh cookie is scoped to
// the auth routes so it is not attached to every API request.
const (
	accessCookie  = "access_token"
	refreshCookie = "refresh_token"
	refreshPath   = "/api/auth"
)

// AuthController handles registration, login, refresh, logout, and profile.
type AuthController struct {
	auth *services.AuthService
	cfg  *config.Config
}

// NewAuthController builds an AuthController.
func NewAuthController(auth *services.AuthService, cfg *config.Config) *AuthController {
	return &AuthController{auth: auth, cfg: cfg}
}

// Register creates an account and signs the user in.
func (ctl *AuthController) Register(c *gin.Context) {
	var input services.RegisterRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	user, err := ctl.auth.Register(input)
	if err != nil {
		if errors.Is(err, services.ErrEmailTaken) {
			c.JSON(http.StatusConflict, gin.H{
				"message": "Email is already registered",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	access, refresh, err := ctl.auth.IssueTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to issue tokens",
			"error":   err.Error(),
		})
		return
	}

	ctl.setAuthCookies(c, access, refresh)
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"data":    user,
	})
}

// Login verifies credentials and signs the user in.
func (ctl *AuthController) Login(c *gin.Context) {
	var input services.LoginRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	user, err := ctl.auth.Login(input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid email or password",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to log in",
			"error":   err.Error(),
		})
		return
	}

	access, refresh, err := ctl.auth.IssueTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to issue tokens",
			"error":   err.Error(),
		})
		return
	}

	ctl.setAuthCookies(c, access, refresh)
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"data":    user,
	})
}

// Refresh rotates the refresh token and returns a fresh access token.
func (ctl *AuthController) Refresh(c *gin.Context) {
	token, err := c.Cookie(refreshCookie)
	if err != nil || token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Refresh token missing",
		})
		return
	}

	user, access, refresh, err := ctl.auth.Refresh(token)
	if err != nil {
		ctl.clearAuthCookies(c)
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Session expired, please log in again",
		})
		return
	}

	ctl.setAuthCookies(c, access, refresh)
	c.JSON(http.StatusOK, gin.H{
		"message": "Token refreshed successfully",
		"data":    user,
	})
}

// Logout revokes the refresh token and clears both cookies.
func (ctl *AuthController) Logout(c *gin.Context) {
	token, _ := c.Cookie(refreshCookie)

	if err := ctl.auth.Logout(token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to log out",
			"error":   err.Error(),
		})
		return
	}

	ctl.clearAuthCookies(c)
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// Me returns the currently authenticated user.
func (ctl *AuthController) Me(c *gin.Context) {
	userID := c.GetString(middleware.ContextUserID)

	user, err := ctl.auth.GetUser(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authentication required",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

func (ctl *AuthController) setAuthCookies(c *gin.Context, access, refresh string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessCookie, access, int(ctl.cfg.AccessTTL.Seconds()), "/", "", ctl.cfg.CookieSecure, true)
	c.SetCookie(refreshCookie, refresh, int(ctl.cfg.RefreshTTL.Seconds()), refreshPath, "", ctl.cfg.CookieSecure, true)
}

func (ctl *AuthController) clearAuthCookies(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessCookie, "", -1, "/", "", ctl.cfg.CookieSecure, true)
	c.SetCookie(refreshCookie, "", -1, refreshPath, "", ctl.cfg.CookieSecure, true)
}
