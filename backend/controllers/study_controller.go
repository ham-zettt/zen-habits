package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// StudyController handles study plans and their reference links.
type StudyController struct {
	study *services.StudyService
}

// NewStudyController builds a StudyController.
func NewStudyController(study *services.StudyService) *StudyController {
	return &StudyController{study: study}
}

// List returns the user's study plans.
func (ctl *StudyController) List(c *gin.Context) {
	plans, err := ctl.study.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load study plans",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": plans})
}

// Create adds a study plan with reference links.
func (ctl *StudyController) Create(c *gin.Context) {
	var input services.CreateStudyPlanRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	plan, err := ctl.study.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create study plan",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Study plan created successfully",
		"data":    plan,
	})
}

// Update edits a study plan title.
func (ctl *StudyController) Update(c *gin.Context) {
	var input services.UpdateStudyPlanRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	plan, err := ctl.study.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update study plan")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Study plan updated successfully",
		"data":    plan,
	})
}

// Toggle flips a study plan between done and not done.
func (ctl *StudyController) Toggle(c *gin.Context) {
	plan, err := ctl.study.Toggle(c.GetString(middleware.ContextUserID), c.Param("id"))
	if err != nil {
		ctl.respondError(c, err, "Failed to update study plan")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Study plan updated successfully",
		"data":    plan,
	})
}

// Delete removes a study plan.
func (ctl *StudyController) Delete(c *gin.Context) {
	if err := ctl.study.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete study plan")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Study plan deleted successfully",
	})
}

// AddLink attaches a reference link to a plan.
func (ctl *StudyController) AddLink(c *gin.Context) {
	var input services.StudyLinkInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	link, err := ctl.study.AddLink(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to add link")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Link added successfully",
		"data":    link,
	})
}

// DeleteLink removes a reference link.
func (ctl *StudyController) DeleteLink(c *gin.Context) {
	if err := ctl.study.DeleteLink(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete link")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Link deleted successfully",
	})
}

func (ctl *StudyController) respondError(c *gin.Context, err error, fallback string) {
	if errors.Is(err, services.ErrNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Study plan not found"})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{
		"message": fallback,
		"error":   err.Error(),
	})
}
