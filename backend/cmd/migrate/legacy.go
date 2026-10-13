package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/services"
)

// legacyMigrationName guards the one-time data migration.
const legacyMigrationName = "legacy-modules-v1"

// runLegacyMigration converts the old Todo/Study/Job rows into custom-module
// items for every user. It is idempotent: once applied (recorded in
// schema_migrations) it never runs again. The old tables are left in place;
// drop them later with cmd/drop-legacy once the result is verified.
func runLegacyMigration(db *gorm.DB) error {
	if err := db.Exec(
		"CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
	).Error; err != nil {
		return err
	}

	applied, err := migrationApplied(db, legacyMigrationName)
	if err != nil {
		return err
	}
	if applied {
		log.Println("legacy modules migration already applied, skipping")
		return nil
	}

	if !legacyTablesPresent(db) {
		log.Println("no legacy tables found, marking migration applied")
		return markMigration(db, legacyMigrationName)
	}

	var userIDs []uuid.UUID
	if err := db.Table("users").Pluck("id", &userIDs).Error; err != nil {
		return err
	}

	migrated := 0
	for _, userID := range userIDs {
		if err := db.Transaction(func(tx *gorm.DB) error {
			return migrateUser(tx, userID)
		}); err != nil {
			return fmt.Errorf("user %s: %w", userID, err)
		}
		migrated++
	}

	if err := markMigration(db, legacyMigrationName); err != nil {
		return err
	}
	log.Printf("legacy modules migration complete for %d user(s)", migrated)
	return nil
}

func migrateUser(tx *gorm.DB, userID uuid.UUID) error {
	// Make sure the three starter modules exist before mapping rows onto them.
	if err := services.SeedDefaultModules(tx, userID); err != nil {
		return err
	}
	if err := migrateTodos(tx, userID); err != nil {
		return err
	}
	if err := migrateStudyPlans(tx, userID); err != nil {
		return err
	}
	return migrateJobs(tx, userID)
}

func migrateTodos(tx *gorm.DB, userID uuid.UUID) error {
	if !tx.Migrator().HasTable("todos") {
		return nil
	}

	var todos []legacyTodo
	if err := tx.Table("todos").Where("user_id = ?", userID).Find(&todos).Error; err != nil {
		return err
	}
	if len(todos) == 0 {
		return nil
	}

	module, err := findModule(tx, userID, "Todo List")
	if err != nil {
		return err
	}
	statusField := fieldByLabel(module, "Status")

	for _, todo := range todos {
		values := map[string]any{}
		if statusField != nil {
			if mapped := mapTodoPriority(todo.Priority); mapped != "" {
				values[statusField.ID.String()] = mapped
			}
		}
		item := models.ModuleItem{
			ModuleID: module.ID,
			UserID:   userID,
			Title:    todo.Title,
			IsDone:   todo.IsDone,
			DoneAt:   todo.DoneAt,
			Values:   mustJSON(values),
		}
		if err := tx.Create(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

func migrateStudyPlans(tx *gorm.DB, userID uuid.UUID) error {
	if !tx.Migrator().HasTable("study_plans") {
		return nil
	}

	var plans []legacyStudyPlan
	if err := tx.Table("study_plans").Where("user_id = ?", userID).Find(&plans).Error; err != nil {
		return err
	}
	if len(plans) == 0 {
		return nil
	}

	module, err := findModule(tx, userID, "Study Plan")
	if err != nil {
		return err
	}

	for _, plan := range plans {
		var links []legacyStudyLink
		if tx.Migrator().HasTable("study_links") {
			if err := tx.Table("study_links").
				Where("plan_id = ?", plan.ID).
				Order("created_at asc").
				Find(&links).Error; err != nil {
				return err
			}
		}

		// Old plans may hold several links; grow the module so none are lost.
		module, err = ensureLinkFields(tx, module, len(links))
		if err != nil {
			return err
		}

		linkFields := linkFieldsOf(module)
		values := map[string]any{}
		for index, link := range links {
			if index >= len(linkFields) || link.URL == "" {
				continue
			}
			values[linkFields[index].ID.String()] = link.URL
		}

		item := models.ModuleItem{
			ModuleID: module.ID,
			UserID:   userID,
			Title:    plan.Title,
			IsDone:   plan.IsDone,
			DoneAt:   plan.DoneAt,
			Values:   mustJSON(values),
		}
		if err := tx.Create(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

func migrateJobs(tx *gorm.DB, userID uuid.UUID) error {
	if !tx.Migrator().HasTable("jobs") {
		return nil
	}

	var jobs []legacyJob
	if err := tx.Table("jobs").Where("user_id = ?", userID).Find(&jobs).Error; err != nil {
		return err
	}
	if len(jobs) == 0 {
		return nil
	}

	module, err := findModule(tx, userID, "Job Tracker")
	if err != nil {
		return err
	}

	positionField := fieldByLabel(module, "Position")
	companyField := fieldByLabel(module, "Company")
	deadlineField := fieldByLabel(module, "Deadline")
	statusField := fieldByLabel(module, "Status")
	urlField := fieldByLabel(module, "Listing URL")

	for _, job := range jobs {
		values := map[string]any{}
		setValue(values, positionField, job.Position)
		setValue(values, companyField, job.Company)
		setValue(values, statusField, job.Status)
		setValue(values, urlField, job.URL)
		if deadlineField != nil && job.Deadline != nil {
			values[deadlineField.ID.String()] = job.Deadline.Format("2006-01-02")
		}

		item := models.ModuleItem{
			ModuleID: module.ID,
			UserID:   userID,
			Title:    job.Position,
			Values:   mustJSON(values),
		}
		if err := tx.Create(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

func ensureLinkFields(tx *gorm.DB, module *models.Module, needed int) (*models.Module, error) {
	links := linkFieldsOf(module)
	for len(links) < needed {
		field := models.ModuleField{
			ModuleID: module.ID,
			Label:    fmt.Sprintf("Reference URL %d", len(links)+1),
			Type:     models.FieldTypeLink,
			Options:  datatypes.JSON([]byte("[]")),
			Position: len(module.Fields),
		}
		if err := tx.Create(&field).Error; err != nil {
			return nil, err
		}
		module.Fields = append(module.Fields, field)
		links = append(links, field)
	}
	return module, nil
}

func findModule(tx *gorm.DB, userID uuid.UUID, title string) (*models.Module, error) {
	var module models.Module
	err := tx.
		Preload("Fields", func(db *gorm.DB) *gorm.DB { return db.Order("position asc") }).
		Where("user_id = ? AND title = ?", userID, title).
		First(&module).Error
	if err != nil {
		return nil, err
	}
	return &module, nil
}

func fieldByLabel(module *models.Module, label string) *models.ModuleField {
	for index := range module.Fields {
		if module.Fields[index].Label == label {
			return &module.Fields[index]
		}
	}
	return nil
}

func linkFieldsOf(module *models.Module) []models.ModuleField {
	fields := make([]models.ModuleField, 0, len(module.Fields))
	for _, field := range module.Fields {
		if field.Type == models.FieldTypeLink {
			fields = append(fields, field)
		}
	}
	return fields
}

func setValue(values map[string]any, field *models.ModuleField, text string) {
	if field != nil && text != "" {
		values[field.ID.String()] = text
	}
}

func mapTodoPriority(priority string) string {
	switch priority {
	case "urgent":
		return "Urgent"
	case "normal":
		return "Normal"
	case "low":
		return "Low"
	default:
		return ""
	}
}

func mustJSON(values map[string]any) datatypes.JSON {
	data, err := json.Marshal(values)
	if err != nil {
		return datatypes.JSON([]byte("{}"))
	}
	return datatypes.JSON(data)
}

func migrationApplied(db *gorm.DB, name string) (bool, error) {
	var count int64
	if err := db.Table("schema_migrations").Where("name = ?", name).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func markMigration(db *gorm.DB, name string) error {
	return db.Exec(
		"INSERT INTO schema_migrations (name) VALUES (?) ON CONFLICT DO NOTHING", name,
	).Error
}

func legacyTablesPresent(db *gorm.DB) bool {
	migrator := db.Migrator()
	return migrator.HasTable("todos") || migrator.HasTable("study_plans") || migrator.HasTable("jobs")
}

// Legacy row shapes (the old v2 schema).

type legacyTodo struct {
	ID       uuid.UUID  `gorm:"column:id"`
	UserID   uuid.UUID  `gorm:"column:user_id"`
	Title    string     `gorm:"column:title"`
	Priority string     `gorm:"column:priority"`
	IsDone   bool       `gorm:"column:is_done"`
	DoneAt   *time.Time `gorm:"column:done_at"`
}

type legacyStudyPlan struct {
	ID     uuid.UUID  `gorm:"column:id"`
	UserID uuid.UUID  `gorm:"column:user_id"`
	Title  string     `gorm:"column:title"`
	IsDone bool       `gorm:"column:is_done"`
	DoneAt *time.Time `gorm:"column:done_at"`
}

type legacyStudyLink struct {
	PlanID uuid.UUID `gorm:"column:plan_id"`
	URL    string    `gorm:"column:url"`
}

type legacyJob struct {
	ID       uuid.UUID  `gorm:"column:id"`
	UserID   uuid.UUID  `gorm:"column:user_id"`
	Position string     `gorm:"column:position"`
	Company  string     `gorm:"column:company"`
	Deadline *time.Time `gorm:"column:deadline"`
	URL      string     `gorm:"column:url"`
	Status   string     `gorm:"column:status"`
}
