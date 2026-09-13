package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base carries the columns every entity shares: a UUID primary key and
// created/updated timestamps.
type Base struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate assigns a UUID when the caller did not provide one.
func (b *Base) BeforeCreate(_ *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
