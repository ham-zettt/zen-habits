package services

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// CreateJobRequest is the payload for a new job application entry.
type CreateJobRequest struct {
	Position string `json:"position" binding:"required,min=1,max=255"`
	Company  string `json:"company" binding:"required,min=1,max=255"`
	Deadline string `json:"deadline" binding:"omitempty"`
	URL      string `json:"url" binding:"omitempty,url,max=2048"`
	Status   string `json:"status" binding:"omitempty"`
}

// UpdateJobRequest edits an existing job entry.
type UpdateJobRequest struct {
	Position *string `json:"position" binding:"omitempty,min=1,max=255"`
	Company  *string `json:"company" binding:"omitempty,min=1,max=255"`
	Deadline *string `json:"deadline" binding:"omitempty"`
	URL      *string `json:"url" binding:"omitempty,url,max=2048"`
	Status   *string `json:"status" binding:"omitempty"`
}

// JobService owns saved job listings.
type JobService struct {
	jobs *repositories.JobRepository
}

// NewJobService builds a JobService.
func NewJobService(db *gorm.DB) *JobService {
	return &JobService{jobs: repositories.NewJobRepository(db)}
}

// List returns the user's job entries, newest first.
func (s *JobService) List(userID string) ([]models.Job, error) {
	return s.jobs.ListByUser(userID)
}

// Create adds a job entry with the Planning status by default.
func (s *JobService) Create(userID string, req CreateJobRequest) (*models.Job, error) {
	status := req.Status
	if status == "" {
		status = models.JobStatusPlanning
	}
	if !validJobStatus(status) {
		return nil, ErrValidation
	}

	deadline, err := parseOptionalDate(req.Deadline)
	if err != nil {
		return nil, ErrValidation
	}

	job := &models.Job{
		UserID:   mustUUID(userID),
		Position: req.Position,
		Company:  req.Company,
		Deadline: deadline,
		URL:      req.URL,
		Status:   status,
	}
	if err := s.jobs.Create(job); err != nil {
		return nil, err
	}
	return job, nil
}

// Update edits a job entry.
func (s *JobService) Update(userID, id string, req UpdateJobRequest) (*models.Job, error) {
	job, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Position != nil {
		job.Position = *req.Position
	}
	if req.Company != nil {
		job.Company = *req.Company
	}
	if req.URL != nil {
		job.URL = *req.URL
	}
	if req.Status != nil {
		if !validJobStatus(*req.Status) {
			return nil, ErrValidation
		}
		job.Status = *req.Status
	}
	if req.Deadline != nil {
		deadline, err := parseOptionalDate(*req.Deadline)
		if err != nil {
			return nil, ErrValidation
		}
		job.Deadline = deadline
	}

	if err := s.jobs.Save(job); err != nil {
		return nil, err
	}
	return job, nil
}

// Delete removes a job entry.
func (s *JobService) Delete(userID, id string) error {
	affected, err := s.jobs.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *JobService) findOwned(userID, id string) (*models.Job, error) {
	job, err := s.jobs.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return job, nil
}

func validJobStatus(status string) bool {
	switch status {
	case models.JobStatusPlanning, models.JobStatusApplied, models.JobStatusInProcess, models.JobStatusRejected:
		return true
	default:
		return false
	}
}

func parseOptionalDate(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse(dateLayout, value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}
