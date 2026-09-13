package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// WishlistController handles planned purchases.
type WishlistController struct {
	wishlist *services.WishlistService
}

// NewWishlistController builds a WishlistController.
func NewWishlistController(wishlist *services.WishlistService) *WishlistController {
	return &WishlistController{wishlist: wishlist}
}

// List returns the user's wishlist.
func (ctl *WishlistController) List(c *gin.Context) {
	items, err := ctl.wishlist.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load wishlist",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}

// Create adds a wishlist item.
func (ctl *WishlistController) Create(c *gin.Context) {
	var input services.CreateWishlistItemRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	item, err := ctl.wishlist.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create wishlist item",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Wishlist item created successfully",
		"data":    item,
	})
}

// Update edits a wishlist item.
func (ctl *WishlistController) Update(c *gin.Context) {
	var input services.UpdateWishlistItemRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	item, err := ctl.wishlist.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Wishlist item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update wishlist item",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Wishlist item updated successfully",
		"data":    item,
	})
}

// Delete removes a wishlist item.
func (ctl *WishlistController) Delete(c *gin.Context) {
	if err := ctl.wishlist.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Wishlist item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete wishlist item",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Wishlist item deleted successfully",
	})
}
