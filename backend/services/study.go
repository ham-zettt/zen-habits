package services

import (
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// StudyLinkInput is a reference link attached to a study plan.
type StudyLinkInput struct {
	Label string `json:"label" binding:"omitempty,max=255"`
	URL   string `json:"url" binding:"required,url,max=2048"`
}

// CreateStudyPlanRequest is the payload for a new study plan.
type CreateStudyPlanRequest struct {
	Title string           `json:"title" binding:"required,min=1,max=255"`
	Links []StudyLinkInput `json:"links" binding:"omitempty,dive"`
}

// UpdateStudyPlanRequest edits a study plan title.
type UpdateStudyPlanRequest struct {
	Title *string `json:"title" binding:"omitempty,min=1,max=255"`
}

// StudyService owns study plans and their reference links.
type StudyService struct {
	plans *repositories.StudyRepository
}

// NewStudyService builds a StudyService.
func NewStudyService(db *gorm.DB) *StudyService {
	return &StudyService{plans: repositories.NewStudyRepository(db)}
}

// List returns the user's study plans with links, unfinished first.
func (s *StudyService) List(userID string) ([]models.StudyPlan, error) {
	return s.plans.ListPlans(userID)
}

// Create adds a study plan with its reference links.
func (s *StudyService) Create(userID string, req CreateStudyPlanRequest) (*models.StudyPlan, error) {
	plan := models.StudyPlan{
		UserID: mustUUID(userID),
		Title:  req.Title,
	}
	for _, link := range req.Links {
		plan.Links = append(plan.Links, models.StudyLink{
			Label: link.Label,
			URL:   link.URL,
		})
	}

	if err := s.plans.CreatePlan(&plan); err != nil {
		return nil, err
	}
	return &plan, nil
}

// Update changes a study plan's title.
func (s *StudyService) Update(userID, id string, req UpdateStudyPlanRequest) (*models.StudyPlan, error) {
	plan, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		plan.Title = *req.Title
	}

	if err := s.plans.SavePlan(plan); err != nil {
		return nil, err
	}
	return plan, nil
}

// Toggle flips a study plan between done and not done.
func (s *StudyService) Toggle(userID, id string) (*models.StudyPlan, error) {
	plan, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	plan.IsDone = !plan.IsDone
	if plan.IsDone {
		now := time.Now()
		plan.DoneAt = &now
	} else {
		plan.DoneAt = nil
	}

	if err := s.plans.SavePlan(plan); err != nil {
		return nil, err
	}
	return plan, nil
}

// Delete removes a plan and its links.
func (s *StudyService) Delete(userID, id string) error {
	plan, err := s.findOwned(userID, id)
	if err != nil {
		return err
	}
	return s.plans.DeletePlanAndLinks(plan)
}

// AddLink attaches a reference link to a plan.
func (s *StudyService) AddLink(userID, planID string, req StudyLinkInput) (*models.StudyLink, error) {
	plan, err := s.findOwned(userID, planID)
	if err != nil {
		return nil, err
	}

	link := &models.StudyLink{
		PlanID: plan.ID,
		Label:  req.Label,
		URL:    req.URL,
	}
	if err := s.plans.CreateLink(link); err != nil {
		return nil, err
	}
	return link, nil
}

// DeleteLink removes a reference link owned by the user.
func (s *StudyService) DeleteLink(userID, linkID string) error {
	link, err := s.plans.FindLink(linkID)
	if err != nil {
		return ErrNotFound
	}

	if _, err := s.findOwned(userID, link.PlanID.String()); err != nil {
		return err
	}

	return s.plans.DeleteLink(link)
}

func (s *StudyService) findOwned(userID, id string) (*models.StudyPlan, error) {
	plan, err := s.plans.FindPlanOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return plan, nil
}
