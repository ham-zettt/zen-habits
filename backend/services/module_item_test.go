package services

import (
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/ham-zettt/zen-habits/models"
)

func TestSortModuleItems(t *testing.T) {
	statusFieldID := uuid.New()
	statusField := models.ModuleField{
		Base:    models.Base{ID: statusFieldID},
		Type:    models.FieldTypeDropdown,
		Options: datatypes.JSON([]byte(`["Urgent","Normal","Low"]`)),
	}

	base := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	newer := base.Add(time.Hour)

	item := func(title, status string, done bool, createdAt time.Time) models.ModuleItem {
		values := map[string]any{}
		if status != "" {
			values[statusFieldID.String()] = status
		}
		data, _ := json.Marshal(values)
		return models.ModuleItem{
			Base:     models.Base{ID: uuid.New(), CreatedAt: createdAt},
			Title:    title,
			IsDone:   done,
			Values:   datatypes.JSON(data),
		}
	}

	titles := func(items []models.ModuleItem) []string {
		out := make([]string, len(items))
		for i, item := range items {
			out[i] = item.Title
		}
		return out
	}

	assertOrder := func(t *testing.T, got, want []string) {
		t.Helper()
		if len(got) != len(want) {
			t.Fatalf("length mismatch: got %v want %v", got, want)
		}
		for i := range got {
			if got[i] != want[i] {
				t.Fatalf("order mismatch: got %v want %v", got, want)
			}
		}
	}

	t.Run("orders by first dropdown option order", func(t *testing.T) {
		items := []models.ModuleItem{
			item("low", "Low", false, base),
			item("urgent", "Urgent", false, base),
			item("normal", "Normal", false, base),
		}
		SortModuleItems(items, &statusField)
		assertOrder(t, titles(items), []string{"urgent", "normal", "low"})
	})

	t.Run("done items always sink to the bottom", func(t *testing.T) {
		items := []models.ModuleItem{
			item("done urgent", "Urgent", true, base),
			item("open low", "Low", false, base),
			item("open urgent", "Urgent", false, base),
		}
		SortModuleItems(items, &statusField)
		assertOrder(t, titles(items), []string{"open urgent", "open low", "done urgent"})
	})

	t.Run("unknown dropdown values rank last among unfinished", func(t *testing.T) {
		items := []models.ModuleItem{
			item("unknown", "SomethingElse", false, base),
			item("normal", "Normal", false, base),
		}
		SortModuleItems(items, &statusField)
		assertOrder(t, titles(items), []string{"normal", "unknown"})
	})

	t.Run("newest first when the module has no dropdown", func(t *testing.T) {
		items := []models.ModuleItem{
			item("older", "", false, base),
			item("newer", "", false, newer),
		}
		SortModuleItems(items, nil)
		assertOrder(t, titles(items), []string{"newer", "older"})
	})
}

func TestNormalizeValues(t *testing.T) {
	textField := models.ModuleField{Base: models.Base{ID: uuid.New()}, Type: models.FieldTypeText}
	dropdownField := models.ModuleField{
		Base:    models.Base{ID: uuid.New()},
		Type:    models.FieldTypeDropdown,
		Options: datatypes.JSON([]byte(`["A","B"]`)),
	}
	linkField := models.ModuleField{Base: models.Base{ID: uuid.New()}, Type: models.FieldTypeLink}
	module := &models.Module{Fields: []models.ModuleField{textField, dropdownField, linkField}}

	values, err := normalizeValues(module, map[string]any{
		textField.ID.String():     "hello",
		dropdownField.ID.String(): "A",
		linkField.ID.String():     "https://example.com",
		"unknown-id":              "ignored",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	var parsed map[string]any
	if err := json.Unmarshal(values, &parsed); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if len(parsed) != 3 {
		t.Fatalf("want 3 stored values, got %d: %v", len(parsed), parsed)
	}

	if _, err := normalizeValues(module, map[string]any{dropdownField.ID.String(): "Z"}); !errors.Is(err, ErrValidation) {
		t.Fatal("expected validation error for unknown dropdown option")
	}

	if _, err := normalizeValues(module, map[string]any{linkField.ID.String(): "not-a-url"}); !errors.Is(err, ErrValidation) {
		t.Fatal("expected validation error for invalid link")
	}
}
