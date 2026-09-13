package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// JobRepository handles job application persistence.
type JobRepository struct {
	db *gorm.DB
}

// NewJobRepository builds a JobRepository.
func NewJobRepository(db *gorm.DB) *JobRepository {
	return &JobRepository{db: db}
}

// ListByUser returns the user's jobs, newest first.
func (r *JobRepository) ListByUser(userID string) ([]models.Job, error) {
	var jobs []models.Job
	if err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&jobs).Error; err != nil {
		return nil, err
	}
	return jobs, nil
}

// Create inserts a job.
func (r *JobRepository) Create(job *models.Job) error {
	return r.db.Create(job).Error
}

// FindOwned returns a job that belongs to the user.
func (r *JobRepository) FindOwned(userID, id string) (*models.Job, error) {
	var job models.Job
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&job).Error; err != nil {
		return nil, err
	}
	return &job, nil
}

// Save updates a job.
func (r *JobRepository) Save(job *models.Job) error {
	return r.db.Save(job).Error
}

// Delete removes a job, returning the number of affected rows.
func (r *JobRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.Job{})
	return result.RowsAffected, result.Error
}
