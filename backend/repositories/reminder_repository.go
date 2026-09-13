package repositories

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// ReminderRepository handles calendar reminder persistence.
type ReminderRepository struct {
	db *gorm.DB
}

// NewReminderRepository builds a ReminderRepository.
func NewReminderRepository(db *gorm.DB) *ReminderRepository {
	return &ReminderRepository{db: db}
}

// ListByUser returns reminders, optionally bounded by a date range.
func (r *ReminderRepository) ListByUser(userID string, start, end *time.Time) ([]models.Reminder, error) {
	query := r.db.Where("user_id = ?", userID)
	if start != nil && end != nil {
		query = query.Where("event_date >= ? AND event_date < ?", *start, *end)
	}

	var reminders []models.Reminder
	if err := query.Order("event_date asc, created_at asc").Find(&reminders).Error; err != nil {
		return nil, err
	}
	return reminders, nil
}

// Create inserts a reminder.
func (r *ReminderRepository) Create(reminder *models.Reminder) error {
	return r.db.Create(reminder).Error
}

// FindOwned returns a reminder that belongs to the user.
func (r *ReminderRepository) FindOwned(userID, id string) (*models.Reminder, error) {
	var reminder models.Reminder
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&reminder).Error; err != nil {
		return nil, err
	}
	return &reminder, nil
}

// Save updates a reminder.
func (r *ReminderRepository) Save(reminder *models.Reminder) error {
	return r.db.Save(reminder).Error
}

// Delete removes a reminder, returning the number of affected rows.
func (r *ReminderRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.Reminder{})
	return result.RowsAffected, result.Error
}
