package repositories

import (
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
)

// TodoRepository handles task persistence.
type TodoRepository struct {
	db *gorm.DB
}

// NewTodoRepository builds a TodoRepository.
func NewTodoRepository(db *gorm.DB) *TodoRepository {
	return &TodoRepository{db: db}
}

// ListByUser returns every task belonging to the user.
func (r *TodoRepository) ListByUser(userID string) ([]models.Todo, error) {
	var todos []models.Todo
	if err := r.db.Where("user_id = ?", userID).Find(&todos).Error; err != nil {
		return nil, err
	}
	return todos, nil
}

// Create inserts a task.
func (r *TodoRepository) Create(todo *models.Todo) error {
	return r.db.Create(todo).Error
}

// FindOwned returns a task that belongs to the user.
func (r *TodoRepository) FindOwned(userID, id string) (*models.Todo, error) {
	var todo models.Todo
	if err := r.db.Where("user_id = ? AND id = ?", userID, id).First(&todo).Error; err != nil {
		return nil, err
	}
	return &todo, nil
}

// Save updates a task.
func (r *TodoRepository) Save(todo *models.Todo) error {
	return r.db.Save(todo).Error
}

// Delete removes a task, returning the number of affected rows.
func (r *TodoRepository) Delete(userID, id string) (int64, error) {
	result := r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&models.Todo{})
	return result.RowsAffected, result.Error
}
