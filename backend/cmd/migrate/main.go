// Command migrate applies the database schema. Use it once against a fresh
// database, or in production where the server runs with RUN_MIGRATIONS=false.
//
//	go run ./cmd/migrate
package main

import (
	"log"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/models"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	if err := db.AutoMigrate(models.AllModels()...); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	log.Println("migrations complete")
}
