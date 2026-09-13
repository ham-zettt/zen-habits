package models

import (
	"time"

	"github.com/google/uuid"
)

// StudyPlan is a learning topic with one or more reference links.
type StudyPlan struct {
	Base
	UserID uuid.UUID   `gorm:"type:uuid;not null;index" json:"userId"`
	Title  string      `gorm:"size:255;not null" json:"title"`
	IsDone bool        `gorm:"not null;default:false" json:"isDone"`
	DoneAt *time.Time  `json:"doneAt"`
	Links  []StudyLink `gorm:"foreignKey:PlanID;constraint:OnDelete:CASCADE" json:"links"`
}

// StudyLink is a reference URL attached to a study plan.
type StudyLink struct {
	Base
	PlanID uuid.UUID `gorm:"type:uuid;not null;index" json:"planId"`
	Label  string    `gorm:"size:255" json:"label"`
	URL    string    `gorm:"size:2048;not null" json:"url"`
}
