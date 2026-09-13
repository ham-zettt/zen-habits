package services

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

const dateLayout = "2006-01-02"
const monthLayout = "2006-01"

// CreateReminderRequest is the payload for a new calendar reminder.
type CreateReminderRequest struct {
	Title     string `json:"title" binding:"required,min=1,max=255"`
	Notes     string `json:"notes" binding:"omitempty,max=2000"`
	EventDate string `json:"eventDate" binding:"required"`
	EventTime string `json:"eventTime" binding:"omitempty"`
}

// UpdateReminderRequest edits an existing reminder.
type UpdateReminderRequest struct {
	Title     *string `json:"title" binding:"omitempty,min=1,max=255"`
	Notes     *string `json:"notes" binding:"omitempty,max=2000"`
	EventDate *string `json:"eventDate" binding:"omitempty"`
	EventTime *string `json:"eventTime" binding:"omitempty"`
}

// ReminderService owns calendar reminders.
type ReminderService struct {
	reminders *repositories.ReminderRepository
}

// NewReminderService builds a ReminderService.
func NewReminderService(db *gorm.DB) *ReminderService {
	return &ReminderService{reminders: repositories.NewReminderRepository(db)}
}

// List returns the user's reminders, optionally filtered to a YYYY-MM month.
func (s *ReminderService) List(userID, month string) ([]models.Reminder, error) {
	var start, end *time.Time
	if month != "" {
		parsed, err := time.Parse(monthLayout, month)
		if err != nil {
			return nil, ErrValidation
		}
		next := parsed.AddDate(0, 1, 0)
		start, end = &parsed, &next
	}

	return s.reminders.ListByUser(userID, start, end)
}

// Create adds a reminder on a given date.
func (s *ReminderService) Create(userID string, req CreateReminderRequest) (*models.Reminder, error) {
	eventDate, err := time.Parse(dateLayout, req.EventDate)
	if err != nil {
		return nil, ErrValidation
	}
	if !validEventTime(req.EventTime) {
		return nil, ErrValidation
	}

	reminder := &models.Reminder{
		UserID:    mustUUID(userID),
		Title:     req.Title,
		Notes:     req.Notes,
		EventDate: eventDate,
		EventTime: req.EventTime,
	}
	if err := s.reminders.Create(reminder); err != nil {
		return nil, err
	}
	return reminder, nil
}

// Update edits a reminder.
func (s *ReminderService) Update(userID, id string, req UpdateReminderRequest) (*models.Reminder, error) {
	reminder, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		reminder.Title = *req.Title
	}
	if req.Notes != nil {
		reminder.Notes = *req.Notes
	}
	if req.EventDate != nil {
		eventDate, err := time.Parse(dateLayout, *req.EventDate)
		if err != nil {
			return nil, ErrValidation
		}
		reminder.EventDate = eventDate
	}
	if req.EventTime != nil {
		if !validEventTime(*req.EventTime) {
			return nil, ErrValidation
		}
		reminder.EventTime = *req.EventTime
	}

	if err := s.reminders.Save(reminder); err != nil {
		return nil, err
	}
	return reminder, nil
}

// Delete removes a reminder.
func (s *ReminderService) Delete(userID, id string) error {
	affected, err := s.reminders.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *ReminderService) findOwned(userID, id string) (*models.Reminder, error) {
	reminder, err := s.reminders.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return reminder, nil
}

// validEventTime accepts an empty time or a 24-hour HH:MM value.
func validEventTime(value string) bool {
	if value == "" {
		return true
	}
	_, err := time.Parse("15:04", value)
	return err == nil
}
