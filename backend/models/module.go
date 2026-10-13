package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Supported custom-module field types.
const (
	FieldTypeText     = "text"
	FieldTypeDropdown = "dropdown"
	FieldTypeSubtask  = "subtask"
	FieldTypeDate     = "date"
	FieldTypeLink     = "link"
)

// Module is a user-defined list template. Its fields describe the shape of
// every item that belongs to it.
type Module struct {
	Base
	UserID      uuid.UUID     `gorm:"type:uuid;not null;index" json:"userId"`
	Title       string        `gorm:"size:255;not null" json:"title"`
	Description string        `json:"description"`
	Fields      []ModuleField `gorm:"foreignKey:ModuleID;constraint:OnDelete:CASCADE" json:"fields"`
}

// ModuleField is one field definition inside a module. Options holds a JSON
// array of strings and is only meaningful for dropdown fields.
type ModuleField struct {
	Base
	ModuleID uuid.UUID      `gorm:"type:uuid;not null;index" json:"moduleId"`
	Label    string         `gorm:"size:255;not null" json:"label"`
	Type     string         `gorm:"size:20;not null" json:"type"`
	Options  datatypes.JSON `gorm:"type:jsonb" json:"options"`
	Position int            `gorm:"not null;default:0" json:"position"`
}

// ModuleItem is one entry in a module. Values is a JSON object keyed by field
// id, so the schema stays simple for user-defined fields.
type ModuleItem struct {
	Base
	ModuleID uuid.UUID      `gorm:"type:uuid;not null;index" json:"moduleId"`
	UserID   uuid.UUID      `gorm:"type:uuid;not null;index:idx_module_items_user_done" json:"userId"`
	Title    string         `gorm:"size:255;not null" json:"title"`
	IsDone   bool           `gorm:"not null;default:false;index:idx_module_items_user_done" json:"isDone"`
	DoneAt   *time.Time     `json:"doneAt"`
	Values   datatypes.JSON `gorm:"type:jsonb" json:"values"`
}
