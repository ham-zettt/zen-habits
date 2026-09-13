package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

// TransactionController handles income and expense entries.
type TransactionController struct {
	transactions *services.TransactionService
}

// NewTransactionController builds a TransactionController.
func NewTransactionController(transactions *services.TransactionService) *TransactionController {
	return &TransactionController{transactions: transactions}
}

// List returns entries, optionally for a single month.
func (ctl *TransactionController) List(c *gin.Context) {
	transactions, err := ctl.transactions.List(
		c.GetString(middleware.ContextUserID),
		c.Query("month"),
	)
	if err != nil {
		ctl.respondError(c, err, "Failed to load transactions")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": transactions})
}

// Summary returns the monthly totals.
func (ctl *TransactionController) Summary(c *gin.Context) {
	summary, err := ctl.transactions.Summary(
		c.GetString(middleware.ContextUserID),
		c.Query("month"),
	)
	if err != nil {
		ctl.respondError(c, err, "Failed to load summary")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": summary})
}

// Create adds an entry.
func (ctl *TransactionController) Create(c *gin.Context) {
	var input services.CreateTransactionRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	transaction, err := ctl.transactions.Create(c.GetString(middleware.ContextUserID), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to create transaction")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transaction created successfully",
		"data":    transaction,
	})
}

// Update edits an entry.
func (ctl *TransactionController) Update(c *gin.Context) {
	var input services.UpdateTransactionRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	transaction, err := ctl.transactions.Update(c.GetString(middleware.ContextUserID), c.Param("id"), input)
	if err != nil {
		ctl.respondError(c, err, "Failed to update transaction")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaction updated successfully",
		"data":    transaction,
	})
}

// Delete removes an entry.
func (ctl *TransactionController) Delete(c *gin.Context) {
	if err := ctl.transactions.Delete(c.GetString(middleware.ContextUserID), c.Param("id")); err != nil {
		ctl.respondError(c, err, "Failed to delete transaction")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaction deleted successfully",
	})
}

func (ctl *TransactionController) respondError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Transaction not found"})
	case errors.Is(err, services.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid amount, kind, or month"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": fallback,
			"error":   err.Error(),
		})
	}
}
