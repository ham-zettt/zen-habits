package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// JobController handles saved job listings.
type JobController struct {
	jobs *services.JobService
}

// NewJobController builds a JobController.
func NewJobController(jobs *services.JobService) *JobController {
	return &JobController{jobs: jobs}
}

// List returns the user's job entries.
func (ctl *JobController) List(c *gin.Context) {
	jobs, err := ctl.jobs.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load jobs",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jobs})
}

// Create adds a job entry.
func (ctl *JobController) Create(c *gin.Context) {
	var input services.CreateJobRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	job, err := ctl.jobs.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to create job")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Job created successfully",
		"data":    job,
	})
}

// Update edits a job entry.
func (ctl *JobController) Update(c *gin.Context) {
	var input services.UpdateJobRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	job, err := ctl.jobs.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update job")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Job updated successfully",
		"data":    job,
	})
}

// Delete removes a job entry.
func (ctl *JobController) Delete(c *gin.Context) {
	if err := ctl.jobs.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete job")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Job deleted successfully",
	})
}

func (ctl *JobController) respondError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Job not found"})
	case errors.Is(err, services.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid status or date"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": fallback,
			"error":   err.Error(),
		})
	}
}
