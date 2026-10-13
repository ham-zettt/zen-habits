package models

// AllModels returns every entity for AutoMigrate.
func AllModels() []any {
	return []any{
		&User{},
		&RefreshToken{},
		&Module{},
		&ModuleField{},
		&ModuleItem{},
		&Reminder{},
		&WorkSession{},
		&Transaction{},
		&WishlistItem{},
	}
}
