package repositories

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// ModuleRepository handles custom modules and their field definitions.
type ModuleRepository struct {
	db *gorm.DB
}

// NewModuleRepository builds a ModuleRepository.
func NewModuleRepository(db *gorm.DB) *ModuleRepository {
	return &ModuleRepository{db: db}
}

// ModuleFieldInput is one field in a create/update request. A nil ID means a
// brand-new field appended at the bottom.
type ModuleFieldInput struct {
	ID      uuid.UUID
	Label   string
	Type    string
	Options datatypes.JSON
}

// ListByUser returns the user's modules with fields ordered by position.
func (r *ModuleRepository) ListByUser(userID string) ([]models.Module, error) {
	var modules []models.Module
	err := r.db.
		Preload("Fields", orderFields).
		Where("user_id = ?", userID).
		Order("created_at asc").
		Find(&modules).Error
	if err != nil {
		return nil, err
	}
	return modules, nil
}

// FindOwned returns a module that belongs to the user, with its fields.
func (r *ModuleRepository) FindOwned(userID, id string) (*models.Module, error) {
	var module models.Module
	err := r.db.
		Preload("Fields", orderFields).
		Where("user_id = ? AND id = ?", userID, id).
		First(&module).Error
	if err != nil {
		return nil, err
	}
	return &module, nil
}

// ExistsByUserAndTitle reports whether the user already has a module with the
// given title.
func (r *ModuleRepository) ExistsByUserAndTitle(userID, title string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Module{}).
		Where("user_id = ? AND title = ?", userID, title).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateWithFields inserts a module and its fields in one transaction.
func (r *ModuleRepository) CreateWithFields(module *models.Module) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(module).Error
	})
}

// UpdateWithFields updates a module and replaces its field set in one
// transaction. Existing fields keep their type; missing fields are deleted and
// their stored values are removed from every item.
func (r *ModuleRepository) UpdateWithFields(module *models.Module, fields []ModuleFieldInput) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.Module{}).
			Where("id = ?", module.ID).
			Updates(map[string]any{
				"title":       module.Title,
				"description": module.Description,
			}).Error; err != nil {
			return err
		}

		var existing []models.ModuleField
		if err := tx.Where("module_id = ?", module.ID).Find(&existing).Error; err != nil {
			return err
		}
		existingByID := make(map[uuid.UUID]models.ModuleField, len(existing))
		for _, field := range existing {
			existingByID[field.ID] = field
		}

		kept := make(map[uuid.UUID]bool, len(fields))
		for position, input := range fields {
			if input.ID != uuid.Nil {
				field, ok := existingByID[input.ID]
				if !ok {
					continue // Unknown id, ignore rather than fail.
				}
				field.Label = input.Label
				field.Options = input.Options
				field.Position = position
				// Type is immutable after creation.
				if err := tx.Save(&field).Error; err != nil {
					return err
				}
				kept[field.ID] = true
				continue
			}

			field := models.ModuleField{
				ModuleID: module.ID,
				Label:    input.Label,
				Type:     input.Type,
				Options:  input.Options,
				Position: position,
			}
			if err := tx.Create(&field).Error; err != nil {
				return err
			}
		}

		for _, field := range existing {
			if kept[field.ID] {
				continue
			}
			if err := tx.Delete(&models.ModuleField{}, "id = ?", field.ID).Error; err != nil {
				return err
			}
			// Drop the deleted field's values from every item.
			if err := tx.Exec(
				"UPDATE module_items SET values = values - ? WHERE module_id = ?",
				field.ID.String(), module.ID,
			).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// DeleteOwned removes a module together with its fields and items.
func (r *ModuleRepository) DeleteOwned(userID, id string) (int64, error) {
	var affected int64
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var module models.Module
		if err := tx.Where("user_id = ? AND id = ?", userID, id).First(&module).Error; err != nil {
			return err
		}
		if err := tx.Where("module_id = ?", module.ID).Delete(&models.ModuleItem{}).Error; err != nil {
			return err
		}
		if err := tx.Where("module_id = ?", module.ID).Delete(&models.ModuleField{}).Error; err != nil {
			return err
		}
		result := tx.Delete(&module)
		affected = result.RowsAffected
		return result.Error
	})
	return affected, err
}

func orderFields(db *gorm.DB) *gorm.DB {
	return db.Order("position asc, created_at asc")
}
