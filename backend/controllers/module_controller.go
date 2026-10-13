package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// ModuleController handles custom modules and their items.
type ModuleController struct {
	modules *services.ModuleService
	items   *services.ModuleItemService
}

// NewModuleController builds a ModuleController.
func NewModuleController(modules *services.ModuleService, items *services.ModuleItemService) *ModuleController {
	return &ModuleController{modules: modules, items: items}
}

// List returns the user's modules.
func (ctl *ModuleController) List(c *gin.Context) {
	modules, err := ctl.modules.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load modules",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": modules})
}

// Get returns one module with its fields.
func (ctl *ModuleController) Get(c *gin.Context) {
	module, err := ctl.modules.Get(c.GetString(middleware.ContextUserID), c.Param("id"))
	if err != nil {
		ctl.respondError(c, err, "Failed to load module")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": module})
}

// Create adds a module with its fields.
func (ctl *ModuleController) Create(c *gin.Context) {
	var input services.ModuleRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	module, err := ctl.modules.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to create module")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Module created successfully",
		"data":    module,
	})
}

// Update edits a module and its structure.
func (ctl *ModuleController) Update(c *gin.Context) {
	var input services.ModuleRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	module, err := ctl.modules.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update module")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Module updated successfully",
		"data":    module,
	})
}

// Delete removes a module with its items.
func (ctl *ModuleController) Delete(c *gin.Context) {
	if err := ctl.modules.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete module")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Module deleted successfully",
	})
}

// ListItems returns a module's items in display order.
func (ctl *ModuleController) ListItems(c *gin.Context) {
	items, err := ctl.items.List(c.GetString(middleware.ContextUserID), c.Param("id"))
	if err != nil {
		ctl.respondError(c, err, "Failed to load items")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}

// CreateItem adds an item to a module.
func (ctl *ModuleController) CreateItem(c *gin.Context) {
	var input services.ModuleItemRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	item, err := ctl.items.Create(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to create item")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Item created successfully",
		"data":    item,
	})
}

// UpdateItem edits an item.
func (ctl *ModuleController) UpdateItem(c *gin.Context) {
	var input services.ModuleItemUpdateRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	item, err := ctl.items.Update(c.GetString(middleware.ContextUserID), c.Param("id"), c.Param("itemId"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update item")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item updated successfully",
		"data":    item,
	})
}

// ToggleItem flips an item between done and not done.
func (ctl *ModuleController) ToggleItem(c *gin.Context) {
	item, err := ctl.items.Toggle(c.GetString(middleware.ContextUserID), c.Param("id"), c.Param("itemId"))
	if err != nil {
		ctl.respondError(c, err, "Failed to update item")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item updated successfully",
		"data":    item,
	})
}

// DeleteItem removes an item.
func (ctl *ModuleController) DeleteItem(c *gin.Context) {
	if err := ctl.items.Delete(c.GetString(middleware.ContextUserID), c.Param("id"), c.Param("itemId")); err != nil {
		ctl.respondError(c, err, "Failed to delete item")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item deleted successfully",
	})
}

func (ctl *ModuleController) respondError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Module or item not found"})
	case errors.Is(err, services.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": fallback,
			"error":   err.Error(),
		})
	}
}
