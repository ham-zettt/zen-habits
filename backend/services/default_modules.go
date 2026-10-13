package services

import (
	"encoding/json"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/repositories"
)

// DefaultFieldTemplate describes one field in a starter module.
type DefaultFieldTemplate struct {
	Label   string
	Type    string
	Options []string
}

// DefaultModuleTemplate describes a starter module seeded for every new user.
type DefaultModuleTemplate struct {
	Title       string
	Description string
	Fields      []DefaultFieldTemplate
}

// DefaultModules returns the three starter modules (the migrated Todo, Study,
// and Job features) in navigation order.
func DefaultModules() []DefaultModuleTemplate {
	return []DefaultModuleTemplate{
		{
			Title:       "Todo List",
			Description: "Manage your daily tasks",
			Fields: []DefaultFieldTemplate{
				{Label: "Task", Type: models.FieldTypeText},
				{Label: "Status", Type: models.FieldTypeDropdown, Options: []string{"Urgent", "Normal", "Low"}},
			},
		},
		{
			Title:       "Study Plan",
			Description: "Manage your learning plans",
			Fields: []DefaultFieldTemplate{
				{Label: "Reference URL", Type: models.FieldTypeLink},
				{Label: "Date", Type: models.FieldTypeDate},
			},
		},
		{
			Title:       "Job Tracker",
			Description: "Track the jobs you are applying for",
			Fields: []DefaultFieldTemplate{
				{Label: "Position", Type: models.FieldTypeText},
				{Label: "Company", Type: models.FieldTypeText},
				{Label: "Deadline", Type: models.FieldTypeDate},
				{Label: "Status", Type: models.FieldTypeDropdown, Options: []string{"Planning", "Applied", "In Process", "Rejected"}},
				{Label: "Listing URL", Type: models.FieldTypeLink},
			},
		},
	}
}

// SeedDefaultModules creates any missing starter modules for a user. It is
// idempotent, so it is safe to call on registration and from the migration.
// Pass a transaction handle to keep it atomic with user creation.
func SeedDefaultModules(db *gorm.DB, userID uuid.UUID) error {
	repo := repositories.NewModuleRepository(db)
	for _, template := range DefaultModules() {
		exists, err := repo.ExistsByUserAndTitle(userID.String(), template.Title)
		if err != nil {
			return err
		}
		if exists {
			continue
		}

		module := moduleFromTemplate(userID, template)
		if err := repo.CreateWithFields(module); err != nil {
			return err
		}
	}
	return nil
}

func moduleFromTemplate(userID uuid.UUID, template DefaultModuleTemplate) *models.Module {
	module := &models.Module{
		UserID:      userID,
		Title:       template.Title,
		Description: template.Description,
	}
	for position, field := range template.Fields {
		module.Fields = append(module.Fields, models.ModuleField{
			Label:    field.Label,
			Type:     field.Type,
			Options:  jsonArray(field.Options),
			Position: position,
		})
	}
	return module
}

// jsonArray marshals a string slice to a JSON array. Nil becomes [].
func jsonArray(values []string) datatypes.JSON {
	if values == nil {
		values = []string{}
	}
	data, err := json.Marshal(values)
	if err != nil {
		return datatypes.JSON([]byte("[]"))
	}
	return datatypes.JSON(data)
}

// parseOptions unmarshals a field's JSON options array.
func parseOptions(options datatypes.JSON) []string {
	if len(options) == 0 {
		return nil
	}
	var values []string
	if err := json.Unmarshal(options, &values); err != nil {
		return nil
	}
	return values
}
