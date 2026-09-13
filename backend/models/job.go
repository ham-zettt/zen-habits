package models

import (
	"time"

	"github.com/google/uuid"
)

// Job application statuses.
const (
	JobStatusPlanning  = "Planning"
	JobStatusApplied   = "Applied"
	JobStatusInProcess = "In Process"
	JobStatusRejected  = "Rejected"
)

// Job is a saved job listing the user is tracking.
type Job struct {
	Base
	UserID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"userId"`
	Position string     `gorm:"size:255;not null" json:"position"`
	Company  string     `gorm:"size:255;not null" json:"company"`
	Deadline *time.Time `gorm:"type:date" json:"deadline"`
	URL      string     `gorm:"size:2048" json:"url"`
	Status   string     `gorm:"size:20;not null;default:Planning" json:"status"`
}
