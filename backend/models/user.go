package models

import (
	"time"

	"github.com/google/uuid"
)

// User is an application account. There is a single role, so no role column.
type User struct {
	Base
	Name         string `gorm:"size:120;not null" json:"name"`
	Email        string `gorm:"size:255;not null;uniqueIndex" json:"email"`
	PasswordHash string `gorm:"not null" json:"-"`
}

// RefreshToken is a hashed, rotating long-lived token tied to a user.
type RefreshToken struct {
	Base
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"userId"`
	TokenHash string    `gorm:"not null" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	Revoked   bool      `gorm:"not null;default:false" json:"revoked"`
}
