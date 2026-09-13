package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// ReminderController handles calendar reminders.
type ReminderController struct {
	reminders *services.ReminderService
}

// NewReminderController builds a ReminderController.
func NewReminderController(reminders *services.ReminderService) *ReminderController {
	return &ReminderController{reminders: reminders}
}

// List returns reminders, optionally for a single month.
func (ctl *ReminderController) List(c *gin.Context) {
	reminders, err := ctl.reminders.List(
		c.GetString(middleware.ContextUserID),
		c.Query("month"),
	)
	if err != nil {
		if errors.Is(err, services.ErrValidation) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid month format"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load reminders",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reminders})
}

// Create adds a reminder.
func (ctl *ReminderController) Create(c *gin.Context) {
	var input services.CreateReminderRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	reminder, err := ctl.reminders.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to create reminder")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Reminder created successfully",
		"data":    reminder,
	})
}

// Update edits a reminder.
func (ctl *ReminderController) Update(c *gin.Context) {
	var input services.UpdateReminderRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	reminder, err := ctl.reminders.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update reminder")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder updated successfully",
		"data":    reminder,
	})
}

// Delete removes a reminder.
func (ctl *ReminderController) Delete(c *gin.Context) {
	if err := ctl.reminders.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete reminder")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder deleted successfully",
	})
}

func (ctl *ReminderController) respondError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Reminder not found"})
	case errors.Is(err, services.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid date format"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": fallback,
			"error":   err.Error(),
		})
	}
}
