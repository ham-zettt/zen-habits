package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// WishlistRepository handles wishlist persistence.
type WishlistRepository struct {
	db *gorm.DB
}

// NewWishlistRepository builds a WishlistRepository.
func NewWishlistRepository(db *gorm.DB) *WishlistRepository {
	return &WishlistRepository{db: db}
}

// ListByUser returns the user's wishlist, unbought items first.
func (r *WishlistRepository) ListByUser(userID string) ([]models.WishlistItem, error) {
	var items []models.WishlistItem
	err := r.db.
		Where("user_id = ?", userID).
		Order("is_bought asc, created_at desc").
		Find(&items).Error
	if err != nil {
		return nil, err
	}
	return items, nil
}

// Create inserts a wishlist item.
func (r *WishlistRepository) Create(item *models.WishlistItem) error {
	return r.db.Create(item).Error
}

// FindOwned returns a wishlist item that belongs to the user.
func (r *WishlistRepository) FindOwned(userID, id string) (*models.WishlistItem, error) {
	var item models.WishlistItem
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

// Save updates a wishlist item.
func (r *WishlistRepository) Save(item *models.WishlistItem) error {
	return r.db.Save(item).Error
}

// Delete removes a wishlist item, returning the number of affected rows.
func (r *WishlistRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.WishlistItem{})
	return result.RowsAffected, result.Error
}
