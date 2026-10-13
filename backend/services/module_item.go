package services

import (
	"encoding/json"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// ModuleItemRequest is the payload for a new item.
type ModuleItemRequest struct {
	Title  string         `json:"title" binding:"required,min=1,max=255"`
	Values map[string]any `json:"values"`
}

// ModuleItemUpdateRequest edits an existing item.
type ModuleItemUpdateRequest struct {
	Title  *string        `json:"title" binding:"omitempty,min=1,max=255"`
	Values map[string]any `json:"values"`
}

// ModuleItemService owns custom module items and value validation.
type ModuleItemService struct {
	items   *repositories.ModuleItemRepository
	modules *repositories.ModuleRepository
}

// NewModuleItemService builds a ModuleItemService.
func NewModuleItemService(db *gorm.DB) *ModuleItemService {
	return &ModuleItemService{
		items:   repositories.NewModuleItemRepository(db),
		modules: repositories.NewModuleRepository(db),
	}
}

// List returns a module's items in display order.
func (s *ModuleItemService) List(userID, moduleID string) ([]models.ModuleItem, error) {
	module, err := s.findModule(userID, moduleID)
	if err != nil {
		return nil, err
	}

	items, err := s.items.ListByModule(module.ID.String())
	if err != nil {
		return nil, err
	}
	SortModuleItems(items, firstDropdownField(module))
	return items, nil
}

// Create adds an item after validating its values against the module fields.
func (s *ModuleItemService) Create(userID, moduleID string, req ModuleItemRequest) (*models.ModuleItem, error) {
	module, err := s.findModule(userID, moduleID)
	if err != nil {
		return nil, err
	}

	values, err := normalizeValues(module, req.Values)
	if err != nil {
		return nil, err
	}

	item := &models.ModuleItem{
		ModuleID: module.ID,
		UserID:   mustUUID(userID),
		Title:    strings.TrimSpace(req.Title),
		Values:   values,
	}
	if err := s.items.Create(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Update edits an item's title and/or values.
func (s *ModuleItemService) Update(userID, moduleID, itemID string, req ModuleItemUpdateRequest) (*models.ModuleItem, error) {
	module, err := s.findModule(userID, moduleID)
	if err != nil {
		return nil, err
	}
	item, err := s.findItem(userID, moduleID, itemID)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		item.Title = strings.TrimSpace(*req.Title)
	}
	if req.Values != nil {
		values, err := normalizeValues(module, req.Values)
		if err != nil {
			return nil, err
		}
		item.Values = values
	}

	if err := s.items.Save(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Toggle flips an item between done and not done.
func (s *ModuleItemService) Toggle(userID, moduleID, itemID string) (*models.ModuleItem, error) {
	item, err := s.findItem(userID, moduleID, itemID)
	if err != nil {
		return nil, err
	}

	item.IsDone = !item.IsDone
	if item.IsDone {
		now := time.Now()
		item.DoneAt = &now
	} else {
		item.DoneAt = nil
	}

	if err := s.items.Save(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Delete removes an item.
func (s *ModuleItemService) Delete(userID, moduleID, itemID string) error {
	affected, err := s.items.Delete(userID, moduleID, itemID)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *ModuleItemService) findModule(userID, moduleID string) (*models.Module, error) {
	module, err := s.modules.FindOwned(userID, moduleID)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return module, nil
}

func (s *ModuleItemService) findItem(userID, moduleID, itemID string) (*models.ModuleItem, error) {
	item, err := s.items.FindOwned(userID, moduleID, itemID)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return item, nil
}

// normalizeValues keeps only values for known fields and validates each one.
func normalizeValues(module *models.Module, raw map[string]any) (datatypes.JSON, error) {
	out := map[string]any{}
	for _, field := range module.Fields {
		value, ok := raw[field.ID.String()]
		if !ok || value == nil {
			continue
		}
		normalized, include, err := normalizeValue(field, value)
		if err != nil {
			return nil, err
		}
		if include {
			out[field.ID.String()] = normalized
		}
	}

	data, err := json.Marshal(out)
	if err != nil {
		return nil, err
	}
	return datatypes.JSON(data), nil
}

func normalizeValue(field models.ModuleField, value any) (any, bool, error) {
	switch field.Type {
	case models.FieldTypeText:
		text, ok := value.(string)
		if !ok {
			return nil, false, ErrValidation
		}
		text = strings.TrimSpace(text)
		return text, text != "", nil

	case models.FieldTypeLink:
		text, ok := value.(string)
		if !ok {
			return nil, false, ErrValidation
		}
		text = strings.TrimSpace(text)
		if text == "" {
			return nil, false, nil
		}
		if !validLink(text) {
			return nil, false, ErrValidation
		}
		return text, true, nil

	case models.FieldTypeDate:
		text, ok := value.(string)
		if !ok {
			return nil, false, ErrValidation
		}
		text = strings.TrimSpace(text)
		if text == "" {
			return nil, false, nil
		}
		if _, err := time.Parse("2006-01-02", text); err != nil {
			return nil, false, ErrValidation
		}
		return text, true, nil

	case models.FieldTypeDropdown:
		text, ok := value.(string)
		if !ok {
			return nil, false, ErrValidation
		}
		text = strings.TrimSpace(text)
		if text == "" {
			return nil, false, nil
		}
		if !contains(parseOptions(field.Options), text) {
			return nil, false, ErrValidation
		}
		return text, true, nil

	case models.FieldTypeSubtask:
		return normalizeSubtasks(value)

	default:
		return nil, false, ErrValidation
	}
}

func normalizeSubtasks(value any) (any, bool, error) {
	list, ok := value.([]any)
	if !ok {
		return nil, false, ErrValidation
	}

	out := make([]map[string]any, 0, len(list))
	for _, entry := range list {
		object, ok := entry.(map[string]any)
		if !ok {
			return nil, false, ErrValidation
		}
		text, _ := object["text"].(string)
		text = strings.TrimSpace(text)
		if text == "" {
			continue
		}
		id, _ := object["id"].(string)
		if id == "" {
			id = uuid.NewString()
		}
		done, _ := object["done"].(bool)
		out = append(out, map[string]any{"id": id, "text": text, "done": done})
	}
	return out, true, nil
}

func validLink(value string) bool {
	parsed, err := url.ParseRequestURI(value)
	if err != nil {
		return false
	}
	return parsed.Scheme == "http" || parsed.Scheme == "https"
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

// SortModuleItems orders items for display: unfinished first, then by the
// option order of the module's first dropdown field (when present; earlier
// options rank higher), then newest first. Items whose dropdown value is not a
// known option rank after the known ones.
func SortModuleItems(items []models.ModuleItem, dropdown *models.ModuleField) {
	rank := map[string]int{}
	if dropdown != nil {
		for index, option := range parseOptions(dropdown.Options) {
			rank[option] = index
		}
	}

	sort.SliceStable(items, func(i, j int) bool {
		if items[i].IsDone != items[j].IsDone {
			return !items[i].IsDone
		}
		if dropdown != nil {
			ri, iok := rank[itemValueString(items[i], dropdown.ID.String())]
			rj, jok := rank[itemValueString(items[j], dropdown.ID.String())]
			if iok != jok {
				return iok
			}
			if ri != rj {
				return ri < rj
			}
		}
		return items[i].CreatedAt.After(items[j].CreatedAt)
	})
}

func itemValueString(item models.ModuleItem, fieldID string) string {
	if len(item.Values) == 0 {
		return ""
	}
	var values map[string]any
	if err := json.Unmarshal(item.Values, &values); err != nil {
		return ""
	}
	text, _ := values[fieldID].(string)
	return text
}

func firstDropdownField(module *models.Module) *models.ModuleField {
	for index := range module.Fields {
		if module.Fields[index].Type == models.FieldTypeDropdown {
			return &module.Fields[index]
		}
	}
	return nil
}
