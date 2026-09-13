package models

// AllModels returns every entity for AutoMigrate.
func AllModels() []any {
	return []any{
		&User{},
		&RefreshToken{},
		&Todo{},
		&StudyPlan{},
		&StudyLink{},
		&Reminder{},
		&Job{},
		&WorkSession{},
		&Transaction{},
		&WishlistItem{},
	}
}
