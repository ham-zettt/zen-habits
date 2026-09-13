package services

import (
	"sort"
	"time"

	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// CreateTodoRequest is the payload for a new task.
type CreateTodoRequest struct {
	Title    string `json:"title" binding:"required,min=1,max=255"`
	Priority string `json:"priority" binding:"omitempty,oneof=urgent normal low"`
}

// UpdateTodoRequest edits an existing task.
type UpdateTodoRequest struct {
	Title    *string `json:"title" binding:"omitempty,min=1,max=255"`
	Priority *string `json:"priority" binding:"omitempty,oneof=urgent normal low"`
}

// TodoService owns task persistence and ordering.
type TodoService struct {
	todos *repositories.TodoRepository
}

// NewTodoService builds a TodoService.
func NewTodoService(db *gorm.DB) *TodoService {
	return &TodoService{todos: repositories.NewTodoRepository(db)}
}

// List returns the user's tasks ordered by priority, with completed tasks
// always last regardless of priority.
func (s *TodoService) List(userID string) ([]models.Todo, error) {
	todos, err := s.todos.ListByUser(userID)
	if err != nil {
		return nil, err
	}
	SortTodos(todos)
	return todos, nil
}

// Create adds a task for the user.
func (s *TodoService) Create(userID string, req CreateTodoRequest) (*models.Todo, error) {
	priority := req.Priority
	if priority == "" {
		priority = models.PriorityNormal
	}

	todo := &models.Todo{
		UserID:   mustUUID(userID),
		Title:    req.Title,
		Priority: priority,
	}
	if err := s.todos.Create(todo); err != nil {
		return nil, err
	}
	return todo, nil
}

// Update changes a task's title and/or priority.
func (s *TodoService) Update(userID, id string, req UpdateTodoRequest) (*models.Todo, error) {
	todo, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		todo.Title = *req.Title
	}
	if req.Priority != nil {
		todo.Priority = *req.Priority
	}

	if err := s.todos.Save(todo); err != nil {
		return nil, err
	}
	return todo, nil
}

// Toggle flips a task between done and not done.
func (s *TodoService) Toggle(userID, id string) (*models.Todo, error) {
	todo, err := s.findOwned(userID, id)
	if err != nil {
		return nil, err
	}

	todo.IsDone = !todo.IsDone
	if todo.IsDone {
		now := time.Now()
		todo.DoneAt = &now
	} else {
		todo.DoneAt = nil
	}

	if err := s.todos.Save(todo); err != nil {
		return nil, err
	}
	return todo, nil
}

// Delete removes a task owned by the user.
func (s *TodoService) Delete(userID, id string) error {
	affected, err := s.todos.Delete(userID, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *TodoService) findOwned(userID, id string) (*models.Todo, error) {
	todo, err := s.todos.FindOwned(userID, id)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return todo, nil
}

// SortTodos orders tasks in place: unfinished first, then by priority
// (urgent, normal, low), then newest first within the same priority.
func SortTodos(todos []models.Todo) {
	sort.SliceStable(todos, func(i, j int) bool {
		if todos[i].IsDone != todos[j].IsDone {
			return !todos[i].IsDone
		}

		ri, rj := priorityRank(todos[i].Priority), priorityRank(todos[j].Priority)
		if ri != rj {
			return ri < rj
		}

		return todos[i].CreatedAt.After(todos[j].CreatedAt)
	})
}

func priorityRank(priority string) int {
	switch priority {
	case models.PriorityUrgent:
		return 0
	case models.PriorityNormal:
		return 1
	case models.PriorityLow:
		return 2
	default:
		return 3
	}
}
