package models

import (
	"time"

	"github.com/google/uuid"
)

// Transaction kinds.
const (
	KindIncome  = "income"
	KindExpense = "expense"
)

// Transaction is a single income or expense entry.
type Transaction struct {
	Base
	UserID      uuid.UUID `gorm:"type:uuid;not null;index:idx_tx_user_date" json:"userId"`
	Kind        string    `gorm:"size:10;not null" json:"kind"`
	AmountCents int64     `gorm:"not null" json:"amountCents"`
	Category    string    `gorm:"size:100" json:"category"`
	OccurredOn  time.Time `gorm:"type:date;not null;index:idx_tx_user_date" json:"occurredOn"`
	Note        string    `json:"note"`
}

// WishlistItem is a planned purchase with its target budget.
type WishlistItem struct {
	Base
	UserID             uuid.UUID `gorm:"type:uuid;not null;index" json:"userId"`
	Name               string    `gorm:"size:255;not null" json:"name"`
	PlannedAmountCents int64     `gorm:"not null" json:"plannedAmountCents"`
	IsBought           bool      `gorm:"not null;default:false" json:"isBought"`
}
