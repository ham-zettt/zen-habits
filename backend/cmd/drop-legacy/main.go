// Command drop-legacy drops the old dedicated Todo/Study/Job tables.
//
// Run it only after the legacy migration in cmd/migrate has been verified:
//
//	go run ./cmd/drop-legacy
package main

import (
	"log"

	"github.com/ham-zettt/zen-habits/config"
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

	// Children first so foreign keys do not block the drop.
	for _, table := range []string{"study_links", "study_plans", "todos", "jobs"} {
		if err := db.Migrator().DropTable(table); err != nil {
			log.Fatalf("drop %s: %v", table, err)
		}
		log.Printf("dropped %s", table)
	}

	log.Println("legacy tables dropped")
}
