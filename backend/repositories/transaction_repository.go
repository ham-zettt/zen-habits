package repositories

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// TransactionRepository handles income/expense persistence.
type TransactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository builds a TransactionRepository.
func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// ListByUser returns entries, optionally bounded by a date range.
func (r *TransactionRepository) ListByUser(userID string, start, end *time.Time) ([]models.Transaction, error) {
	query := r.db.Where("user_id = ?", userID)
	if start != nil && end != nil {
		query = query.Where("occurred_on >= ? AND occurred_on < ?", *start, *end)
	}

	var transactions []models.Transaction
	if err := query.Order("occurred_on desc, created_at desc").Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

// Create inserts a transaction.
func (r *TransactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

// FindOwned returns a transaction that belongs to the user.
func (r *TransactionRepository) FindOwned(userID, id string) (*models.Transaction, error) {
	var transaction models.Transaction
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&transaction).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

// Save updates a transaction.
func (r *TransactionRepository) Save(transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

// Delete removes a transaction, returning the number of affected rows.
func (r *TransactionRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.Transaction{})
	return result.RowsAffected, result.Error
}
