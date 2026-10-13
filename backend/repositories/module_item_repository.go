package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// ModuleItemRepository handles custom module items.
type ModuleItemRepository struct {
	db *gorm.DB
}

// NewModuleItemRepository builds a ModuleItemRepository.
func NewModuleItemRepository(db *gorm.DB) *ModuleItemRepository {
	return &ModuleItemRepository{db: db}
}

// ListByModule returns every item in a module.
func (r *ModuleItemRepository) ListByModule(moduleID string) ([]models.ModuleItem, error) {
	var items []models.ModuleItem
	if err := r.db.Where("module_id = ?", moduleID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

// Create inserts an item.
func (r *ModuleItemRepository) Create(item *models.ModuleItem) error {
	return r.db.Create(item).Error
}

// FindOwned returns an item that belongs to the user and module.
func (r *ModuleItemRepository) FindOwned(userID, moduleID, itemID string) (*models.ModuleItem, error) {
	var item models.ModuleItem
	err := r.db.
		Where("user_id = ? AND module_id = ? AND id = ?", userID, moduleID, itemID).
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

// Save updates an item.
func (r *ModuleItemRepository) Save(item *models.ModuleItem) error {
	return r.db.Save(item).Error
}

// Delete removes an item, returning the number of affected rows.
func (r *ModuleItemRepository) Delete(userID, moduleID, itemID string) (int64, error) {
	result := r.db.
		Where("user_id = ? AND module_id = ? AND id = ?", userID, moduleID, itemID).
		Delete(&models.ModuleItem{})
	return result.RowsAffected, result.Error
}

// CountByModule returns how many items a module currently has.
func (r *ModuleItemRepository) CountByModule(moduleID string) (int64, error) {
	var count int64
	err := r.db.Model(&models.ModuleItem{}).Where("module_id = ?", moduleID).Count(&count).Error
	return count, err
}
