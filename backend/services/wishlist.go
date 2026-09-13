package services

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// CreateWishlistItemRequest is the payload for a planned purchase.
type CreateWishlistItemRequest struct {
	Name               string `json:"name" binding:"required,min=1,max=255"`
	PlannedAmountCents int64  `json:"plannedAmountCents" binding:"required,gt=0"`
}

// UpdateWishlistItemRequest edits a wishlist item.
type UpdateWishlistItemRequest struct {
	Name               *string `json:"name" binding:"omitempty,min=1,max=255"`
	PlannedAmountCents *int64  `json:"plannedAmountCents" binding:"omitempty,gt=0"`
	IsBought           *bool   `json:"isBought"`
}

// WishlistService owns planned purchases.
type WishlistService struct {
	items *repositories.WishlistRepository
}

// NewWishlistService builds a WishlistService.
func NewWishlistService(db *gorm.DB) *WishlistService {
	return &WishlistService{items: repositories.NewWishlistRepository(db)}
}

// List returns the user's wishlist, unbought items first.
func (s *WishlistService) List(userID string) ([]models.WishlistItem, error) {
	return s.items.ListByUser(userID)
}

// Create adds a wishlist item.
func (s *WishlistService) Create(userID string, req CreateWishlistItemRequest) (*models.WishlistItem, error) {
	item := &models.WishlistItem{
		UserID:             mustUUID(userID),
		Name:               req.Name,
		PlannedAmountCents: req.PlannedAmountCents,
	}
	if err := s.items.Create(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Update edits a wishlist item.
func (s *WishlistService) Update(userID, id string, req UpdateWishlistItemRequest) (*models.WishlistItem, error) {
	item, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.PlannedAmountCents != nil {
		item.PlannedAmountCents = *req.PlannedAmountCents
	}
	if req.IsBought != nil {
		item.IsBought = *req.IsBought
	}

	if err := s.items.Save(item); err != nil {
		return nil, err
	}
	return item, nil
}

// Delete removes a wishlist item.
func (s *WishlistService) Delete(userID, id string) error {
	affected, err := s.items.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *WishlistService) findOwned(userID, id string) (*models.WishlistItem, error) {
	item, err := s.items.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return item, nil
}
