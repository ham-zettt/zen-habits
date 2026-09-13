package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// TodoController handles the daily task list.
type TodoController struct {
	todos *services.TodoService
}

// NewTodoController builds a TodoController.
func NewTodoController(todos *services.TodoService) *TodoController {
	return &TodoController{todos: todos}
}

// List returns the user's tasks in display order.
func (ctl *TodoController) List(c *gin.Context) {
	todos, err := ctl.todos.List(c.GetString(middleware.ContextUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to load tasks",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": todos,
	})
}

// Create adds a task.
func (ctl *TodoController) Create(c *gin.Context) {
	var input services.CreateTodoRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	todo, err := ctl.todos.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create task",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Task created successfully",
		"data":    todo,
	})
}

// Update edits a task's title and/or priority.
func (ctl *TodoController) Update(c *gin.Context) {
	var input services.UpdateTodoRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	todo, err := ctl.todos.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update task",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task updated successfully",
		"data":    todo,
	})
}

// Toggle flips a task between done and not done.
func (ctl *TodoController) Toggle(c *gin.Context) {
	todo, err := ctl.todos.Toggle(c.GetString(middleware.ContextUserID), c.Param("id"))
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update task",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task updated successfully",
		"data":    todo,
	})
}

// Delete removes a task.
func (ctl *TodoController) Delete(c *gin.Context) {
	if err := ctl.todos.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete task",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}
