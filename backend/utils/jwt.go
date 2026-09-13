package utils

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Token types embedded in the JWT so an access token can never be used where
// a refresh token is expected, and vice versa.
const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

// ErrInvalidToken is returned for any malformed, expired, or wrong-type token.
var ErrInvalidToken = errors.New("invalid token")

// Claims is the JWT payload for both access and refresh tokens.
type Claims struct {
	UserID    string `json:"uid"`
	TokenType string `json:"typ"`
	jwt.RegisteredClaims
}

// GenerateToken signs a JWT for the given user and token type.
func GenerateToken(secret, userID, tokenType string, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:    userID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			ID:        randomHex(16),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

// ParseToken verifies the signature, expiry, and token type.
func ParseToken(secret, tokenString, wantType string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid || claims.TokenType != wantType {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
