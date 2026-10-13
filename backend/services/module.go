package services

import (
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// ModuleFieldPayload is one field in a create/update module request.
type ModuleFieldPayload struct {
	ID      string   `json:"id"`
	Label   string   `json:"label"`
	Type    string   `json:"type"`
	Options []string `json:"options"`
}

// ModuleRequest is the payload for creating or updating a module.
type ModuleRequest struct {
	Title       string               `json:"title" binding:"required,min=1,max=255"`
	Description string               `json:"description" binding:"max=2000"`
	Fields      []ModuleFieldPayload `json:"fields"`
}

// ModuleService owns custom modules and their field definitions.
type ModuleService struct {
	modules *repositories.ModuleRepository
}

// NewModuleService builds a ModuleService.
func NewModuleService(db *gorm.DB) *ModuleService {
	return &ModuleService{modules: repositories.NewModuleRepository(db)}
}

// List returns the user's modules.
func (s *ModuleService) List(userID string) ([]models.Module, error) {
	return s.modules.ListByUser(userID)
}

// Get returns one module the user owns.
func (s *ModuleService) Get(userID, id string) (*models.Module, error) {
	module, err := s.modules.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return module, nil
}

// Create stores a module with its fields.
func (s *ModuleService) Create(userID string, req ModuleRequest) (*models.Module, error) {
	normalized, err := normalizeFields(req.Fields)
	if err != nil {
		return nil, err
	}

	module := &models.Module{
		UserID:      mustUUID(userID),
		Title:       strings.TrimSpace(req.Title),
		Description: strings.TrimSpace(req.Description),
	}
	for position, field := range normalized {
		module.Fields = append(module.Fields, models.ModuleField{
			Label:    field.Label,
			Type:     field.Type,
			Options:  field.Options,
			Position: position,
		})
	}

	if err := s.modules.CreateWithFields(module); err != nil {
		return nil, err
	}
	return s.Get(userID, module.ID.String())
}

// Update edits a module and its structure.
func (s *ModuleService) Update(userID, id string, req ModuleRequest) (*models.Module, error) {
	module, err := s.Get(userID, id)
	if err != nil {
		return nil, err
	}

	normalized, err := normalizeFields(req.Fields)
	if err != nil {
		return nil, err
	}

	module.Title = strings.TrimSpace(req.Title)
	module.Description = strings.TrimSpace(req.Description)

	inputs := make([]repositories.ModuleFieldInput, 0, len(normalized))
	for _, field := range normalized {
		inputs = append(inputs, repositories.ModuleFieldInput{
			ID:      field.ID,
			Label:   field.Label,
			Type:    field.Type,
			Options: field.Options,
		})
	}

	if err := s.modules.UpdateWithFields(module, inputs); err != nil {
		return nil, err
	}
	return s.Get(userID, id)
}

// Delete removes a module with its fields and items.
func (s *ModuleService) Delete(userID, id string) error {
	affected, err := s.modules.DeleteOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return ErrNotFound
		}
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

type normalizedField struct {
	ID      uuid.UUID
	Label   string
	Type    string
	Options datatypes.JSON
}

func normalizeFields(payload []ModuleFieldPayload) ([]normalizedField, error) {
	fields := make([]normalizedField, 0, len(payload))
	for _, item := range payload {
		label := strings.TrimSpace(item.Label)
		if label == "" {
			return nil, ErrValidation
		}
		if !validFieldType(item.Type) {
			return nil, ErrValidation
		}

		var id uuid.UUID
		if item.ID != "" {
			parsed, err := uuid.Parse(item.ID)
			if err != nil {
				return nil, ErrValidation
			}
			id = parsed
		}

		options := []string{}
		if item.Type == models.FieldTypeDropdown {
			options = cleanOptions(item.Options)
			if len(options) == 0 {
				return nil, ErrValidation
			}
		}

		fields = append(fields, normalizedField{
			ID:      id,
			Label:   label,
			Type:    item.Type,
			Options: jsonArray(options),
		})
	}
	return fields, nil
}

func cleanOptions(options []string) []string {
	cleaned := make([]string, 0, len(options))
	for _, option := range options {
		if trimmed := strings.TrimSpace(option); trimmed != "" {
			cleaned = append(cleaned, trimmed)
		}
	}
	return cleaned
}

func validFieldType(fieldType string) bool {
	switch fieldType {
	case models.FieldTypeText, models.FieldTypeDropdown, models.FieldTypeSubtask, models.FieldTypeDate, models.FieldTypeLink:
		return true
	default:
		return false
	}
}
