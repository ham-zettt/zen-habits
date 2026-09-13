package models

import (
	"time"

	"github.com/google/uuid"
)

// Todo priorities, ordered most to least urgent.
const (
	PriorityUrgent = "urgent"
	PriorityNormal = "normal"
	PriorityLow    = "low"
)

// Todo is a single daily task. Priority drives list ordering; done tasks
// always sink to the bottom regardless of priority.
type Todo struct {
	Base
	UserID   uuid.UUID  `gorm:"type:uuid;not null;index:idx_todos_user_done" json:"userId"`
	Title    string     `gorm:"size:255;not null" json:"title"`
	Priority string     `gorm:"size:20;not null;default:normal" json:"priority"`
	IsDone   bool       `gorm:"not null;default:false;index:idx_todos_user_done" json:"isDone"`
	DoneAt   *time.Time `json:"doneAt"`
}
