package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// StudyRepository handles study plans and their reference links.
type StudyRepository struct {
	db *gorm.DB
}

// NewStudyRepository builds a StudyRepository.
func NewStudyRepository(db *gorm.DB) *StudyRepository {
	return &StudyRepository{db: db}
}

// ListPlans returns the user's plans with links, unfinished first.
func (r *StudyRepository) ListPlans(userID string) ([]models.StudyPlan, error) {
	var plans []models.StudyPlan
	err := r.db.
		Preload("Links", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		Where("user_id = ?", userID).
		Order("is_done asc, created_at desc").
		Find(&plans).Error
	if err != nil {
		return nil, err
	}
	return plans, nil
}

// CreatePlan inserts a plan together with its links.
func (r *StudyRepository) CreatePlan(plan *models.StudyPlan) error {
	return r.db.Create(plan).Error
}

// FindPlanOwned returns a plan that belongs to the user.
func (r *StudyRepository) FindPlanOwned(userID, id string) (*models.StudyPlan, error) {
	var plan models.StudyPlan
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&plan).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

// SavePlan updates a plan.
func (r *StudyRepository) SavePlan(plan *models.StudyPlan) error {
	return r.db.Save(plan).Error
}

// DeletePlanAndLinks removes a plan and its links in one transaction.
func (r *StudyRepository) DeletePlanAndLinks(plan *models.StudyPlan) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("plan_id = ?", plan.ID).Delete(&models.StudyLink{}).Error; err != nil {
			return err
		}
		return tx.Delete(plan).Error
	})
}

// CreateLink inserts a reference link.
func (r *StudyRepository) CreateLink(link *models.StudyLink) error {
	return r.db.Create(link).Error
}

// FindLink returns a reference link by ID.
func (r *StudyRepository) FindLink(id string) (*models.StudyLink, error) {
	var link models.StudyLink
	if err := r.db.First(&link, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

// DeleteLink removes a reference link.
func (r *StudyRepository) DeleteLink(link *models.StudyLink) error {
	return r.db.Delete(link).Error
}
