package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// WorkSessionController handles the start/stop work timer.
type WorkSessionController struct {
	sessions *services.WorkSessionService
}

// NewWorkSessionController builds a WorkSessionController.
func NewWorkSessionController(sessions *services.WorkSessionService) *WorkSessionController {
	return &WorkSessionController{sessions: sessions}
}

// List returns the user's work sessions.
func (ctl *WorkSessionController) List(c *gin.Context) {
	sessions, err := ctl.sessions.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load work sessions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sessions})
}

// Start begins a work session.
func (ctl *WorkSessionController) Start(c *gin.Context) {
	var input services.StartWorkSessionRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	session, err := ctl.sessions.Start(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to start session")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Work session started",
		"data":    session,
	})
}

// Stop ends a running session.
func (ctl *WorkSessionController) Stop(c *gin.Context) {
	session, err := ctl.sessions.Stop(c.GetString(middleware.ContextUserID), c.Param("id"))
	if err != nil {
		ctl.respondError(c, err, "Failed to stop session")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Work session stopped",
		"data":    session,
	})
}

// Delete removes a session.
func (ctl *WorkSessionController) Delete(c *gin.Context) {
	if err := ctl.sessions.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete session")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Work session deleted",
	})
}

func (ctl *WorkSessionController) respondError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Work session not found"})
	case errors.Is(err, services.ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"message": "Session is already running or already stopped"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": fallback,
			"error":   err.Error(),
		})
	}
}
