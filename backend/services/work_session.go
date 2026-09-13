package services

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// StartWorkSessionRequest is the payload for starting a work session.
type StartWorkSessionRequest struct {
	Note string `json:"note" binding:"omitempty,max=2000"`
}

// WorkSessionResponse adds a computed duration to a stored session.
type WorkSessionResponse struct {
	models.WorkSession
	DurationSeconds int64 `json:"durationSeconds"`
}

// WorkSessionService owns start/stop work tracking.
type WorkSessionService struct {
	sessions *repositories.WorkSessionRepository
}

// NewWorkSessionService builds a WorkSessionService.
func NewWorkSessionService(db *gorm.DB) *WorkSessionService {
	return &WorkSessionService{sessions: repositories.NewWorkSessionRepository(db)}
}

// List returns the user's sessions, newest first, with durations.
func (s *WorkSessionService) List(userID string) ([]WorkSessionResponse, error) {
	sessions, err := s.sessions.ListByUser(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]WorkSessionResponse, len(sessions))
	for i, session := range sessions {
		responses[i] = toWorkSessionResponse(session)
	}
	return responses, nil
}

// Start begins a session, rejecting a second concurrent one.
func (s *WorkSessionService) Start(userID string, req StartWorkSessionRequest) (*WorkSessionResponse, error) {
	running, err := s.sessions.CountRunning(userID)
	if err != nil {
		return nil, err
	}
	if running > 0 {
		return nil, ErrConflict
	}

	session := &models.WorkSession{
		UserID:    mustUUID(userID),
		StartedAt: time.Now(),
		Note:      req.Note,
	}
	if err := s.sessions.Create(session); err != nil {
		return nil, err
	}

	response := toWorkSessionResponse(*session)
	return &response, nil
}

// Stop ends a running session.
func (s *WorkSessionService) Stop(userID, id string) (*WorkSessionResponse, error) {
	session, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}
	if session.EndedAt != nil {
		return nil, ErrConflict
	}

	now := time.Now()
	session.EndedAt = &now
	if err := s.sessions.Save(session); err != nil {
		return nil, err
	}

	response := toWorkSessionResponse(*session)
	return &response, nil
}

// Delete removes a session.
func (s *WorkSessionService) Delete(userID, id string) error {
	affected, err := s.sessions.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *WorkSessionService) findOwned(userID, id string) (*models.WorkSession, error) {
	session, err := s.sessions.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return session, nil
}

func toWorkSessionResponse(session models.WorkSession) WorkSessionResponse {
	return WorkSessionResponse{
		WorkSession:     session,
		DurationSeconds: durationSeconds(session.StartedAt, session.EndedAt),
	}
}

// durationSeconds computes a session length from its timestamps. A running or
// inverted session reports zero.
func durationSeconds(startedAt time.Time, endedAt *time.Time) int64 {
	if endedAt == nil {
		return 0
	}
	elapsed := endedAt.Sub(startedAt)
	if elapsed <= 0 {
		return 0
	}
	return int64(elapsed.Seconds())
}
