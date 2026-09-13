package services

import (
	"testing"
	"time"

	"github.com/ham-zettt/zen-habits/models"
)

func todo(title, priority string, done bool, createdAt time.Time) models.Todo {
	return models.Todo{
		Base:     models.Base{CreatedAt: createdAt},
		Title:    title,
		Priority: priority,
		IsDone:   done,
	}
}

func titles(todos []models.Todo) []string {
	out := make([]string, len(todos))
	for i, todo := range todos {
		out[i] = todo.Title
	}
	return out
}

func TestSortTodos(t *testing.T) {
	base := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	older := base
	newer := base.Add(time.Hour)

	tests := []struct {
		name  string
		input []models.Todo
		want  []string
	}{
		{
			name: "orders by priority",
			input: []models.Todo{
				todo("low", models.PriorityLow, false, base),
				todo("urgent", models.PriorityUrgent, false, base),
				todo("normal", models.PriorityNormal, false, base),
			},
			want: []string{"urgent", "normal", "low"},
		},
		{
			name: "completed tasks sink below unfinished ones",
			input: []models.Todo{
				todo("done urgent", models.PriorityUrgent, true, base),
				todo("open low", models.PriorityLow, false, base),
				todo("open urgent", models.PriorityUrgent, false, base),
			},
			want: []string{"open urgent", "open low", "done urgent"},
		},
		{
			name: "newest first within the same priority",
			input: []models.Todo{
				todo("older normal", models.PriorityNormal, false, older),
				todo("newer normal", models.PriorityNormal, false, newer),
			},
			want: []string{"newer normal", "older normal"},
		},
		{
			name:  "empty slice is safe",
			input: []models.Todo{},
			want:  []string{},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			SortTodos(test.input)
			got := titles(test.input)
			if len(got) != len(test.want) {
				t.Fatalf("length mismatch: got %v, want %v", got, test.want)
			}
			for i := range got {
				if got[i] != test.want[i] {
					t.Fatalf("order mismatch: got %v, want %v", got, test.want)
				}
			}
		})
	}
}
