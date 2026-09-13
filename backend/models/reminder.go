package models

import (
	"time"

	"github.com/google/uuid"
)

// Reminder is a dated event shown on the calendar.
type Reminder struct {
	Base
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"userId"`
	Title     string    `gorm:"size:255;not null" json:"title"`
	Notes     string    `json:"notes"`
	EventDate time.Time `gorm:"type:date;not null;index" json:"eventDate"`
	EventTime string    `gorm:"size:5;not null;default:''" json:"eventTime"`
}
