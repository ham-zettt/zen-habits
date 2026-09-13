package models

import (
	"time"

	"github.com/google/uuid"
)

// WorkSession is a start/stop work interval. Duration is derived from the
// timestamps, never stored.
type WorkSession struct {
	Base
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"userId"`
	StartedAt time.Time  `gorm:"not null" json:"startedAt"`
	EndedAt   *time.Time `json:"endedAt"`
	Note      string     `json:"note"`
}
