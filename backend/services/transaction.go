package services

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// CreateTransactionRequest is the payload for a new income/expense entry.
type CreateTransactionRequest struct {
	Kind        string `json:"kind" binding:"required"`
	AmountCents int64  `json:"amountCents" binding:"required,gt=0"`
	Category    string `json:"category" binding:"omitempty,max=100"`
	OccurredOn  string `json:"occurredOn" binding:"required"`
	Note        string `json:"note" binding:"omitempty,max=2000"`
}

// UpdateTransactionRequest edits an existing entry.
type UpdateTransactionRequest struct {
	Kind        *string `json:"kind" binding:"omitempty"`
	AmountCents *int64  `json:"amountCents" binding:"omitempty,gt=0"`
	Category    *string `json:"category" binding:"omitempty,max=100"`
	OccurredOn  *string `json:"occurredOn" binding:"omitempty"`
	Note        *string `json:"note" binding:"omitempty,max=2000"`
}

// TransactionSummary is the monthly income/expense rollup.
type TransactionSummary struct {
	Month        string `json:"month"`
	IncomeCents  int64  `json:"incomeCents"`
	ExpenseCents int64  `json:"expenseCents"`
	BalanceCents int64  `json:"balanceCents"`
}

// TransactionService owns income and expense entries.
type TransactionService struct {
	transactions *repositories.TransactionRepository
}

// NewTransactionService builds a TransactionService.
func NewTransactionService(db *gorm.DB) *TransactionService {
	return &TransactionService{transactions: repositories.NewTransactionRepository(db)}
}

// List returns entries, optionally filtered to a YYYY-MM month.
func (s *TransactionService) List(userID, month string) ([]models.Transaction, error) {
	start, end, err := monthRange(month)
	if err != nil {
		return nil, err
	}
	return s.transactions.ListByUser(userID, start, end)
}

// Summary totals income and expenses for a month.
func (s *TransactionService) Summary(userID, month string) (*TransactionSummary, error) {
	if month == "" {
		month = time.Now().Format(monthLayout)
	}

	start, end, err := monthRange(month)
	if err != nil {
		return nil, err
	}

	transactions, err := s.transactions.ListByUser(userID, start, end)
	if err != nil {
		return nil, err
	}

	summary := &TransactionSummary{Month: month}
	for _, transaction := range transactions {
		if transaction.Kind == models.KindIncome {
			summary.IncomeCents += transaction.AmountCents
		} else {
			summary.ExpenseCents += transaction.AmountCents
		}
	}
	summary.BalanceCents = summary.IncomeCents - summary.ExpenseCents
	return summary, nil
}

// Create adds an income or expense entry.
func (s *TransactionService) Create(userID string, req CreateTransactionRequest) (*models.Transaction, error) {
	if !validKind(req.Kind) {
		return nil, ErrValidation
	}

	occurredOn, err := time.Parse(dateLayout, req.OccurredOn)
	if err != nil {
		return nil, ErrValidation
	}

	transaction := &models.Transaction{
		UserID:      mustUUID(userID),
		Kind:        req.Kind,
		AmountCents: req.AmountCents,
		Category:    req.Category,
		OccurredOn:  occurredOn,
		Note:        req.Note,
	}
	if err := s.transactions.Create(transaction); err != nil {
		return nil, err
	}
	return transaction, nil
}

// Update edits an entry.
func (s *TransactionService) Update(userID, id string, req UpdateTransactionRequest) (*models.Transaction, error) {
	transaction, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Kind != nil {
		if !validKind(*req.Kind) {
			return nil, ErrValidation
		}
		transaction.Kind = *req.Kind
	}
	if req.AmountCents != nil {
		transaction.AmountCents = *req.AmountCents
	}
	if req.Category != nil {
		transaction.Category = *req.Category
	}
	if req.Note != nil {
		transaction.Note = *req.Note
	}
	if req.OccurredOn != nil {
		occurredOn, err := time.Parse(dateLayout, *req.OccurredOn)
		if err != nil {
			return nil, ErrValidation
		}
		transaction.OccurredOn = occurredOn
	}

	if err := s.transactions.Save(transaction); err != nil {
		return nil, err
	}
	return transaction, nil
}

// Delete removes an entry.
func (s *TransactionService) Delete(userID, id string) error {
	affected, err := s.transactions.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *TransactionService) findOwned(userID, id string) (*models.Transaction, error) {
	transaction, err := s.transactions.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return transaction, nil
}

func monthRange(month string) (*time.Time, *time.Time, error) {
	if month == "" {
		return nil, nil, nil
	}
	start, err := time.Parse(monthLayout, month)
	if err != nil {
		return nil, nil, ErrValidation
	}
	end := start.AddDate(0, 1, 0)
	return &start, &end, nil
}

func validKind(kind string) bool {
	return kind == models.KindIncome || kind == models.KindExpense
}
