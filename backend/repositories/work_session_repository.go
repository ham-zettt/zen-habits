package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// WorkSessionRepository handles work-session persistence.
type WorkSessionRepository struct {
	db *gorm.DB
}

// NewWorkSessionRepository builds a WorkSessionRepository.
func NewWorkSessionRepository(db *gorm.DB) *WorkSessionRepository {
	return &WorkSessionRepository{db: db}
}

// ListByUser returns the user's sessions, newest first.
func (r *WorkSessionRepository) ListByUser(userID string) ([]models.WorkSession, error) {
	var sessions []models.WorkSession
	if err := r.db.Where("user_id = ?", userID).Order("started_at desc").Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil
}

// CountRunning returns how many sessions are currently open.
func (r *WorkSessionRepository) CountRunning(userID string) (int64, error) {
	var count int64
	err := r.db.Model(&models.WorkSession{}).
		Where("user_id = ? AND ended_at IS NULL", userID).
		Count(&count).Error
	return count, err
}

// Create inserts a session.
func (r *WorkSessionRepository) Create(session *models.WorkSession) error {
	return r.db.Create(session).Error
}

// FindOwned returns a session that belongs to the user.
func (r *WorkSessionRepository) FindOwned(userID, id string) (*models.WorkSession, error) {
	var session models.WorkSession
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

// Save updates a session.
func (r *WorkSessionRepository) Save(session *models.WorkSession) error {
	return r.db.Save(session).Error
}

// Delete removes a session, returning the number of affected rows.
func (r *WorkSessionRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.WorkSession{})
	return result.RowsAffected, result.Error
}
