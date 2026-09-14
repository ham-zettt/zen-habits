package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/models"
	"github.com/ham-zettt/zen-habits/routes"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	gin.SetMode(cfg.GinMode)

	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	// Migrations run on boot for local development. On serverless platforms
	// (Vercel) set RUN_MIGRATIONS=false and run `go run ./cmd/migrate` once,
	// so cold starts stay fast and concurrent instances never race on DDL.
	if cfg.RunMigrations {
		if err := db.AutoMigrate(models.AllModels()...); err != nil {
			log.Fatalf("migrate: %v", err)
		}
	}

	r := gin.New()
	r.Use(middleware.Logger(), gin.Recovery())
	r.Use(middleware.CORS(cfg.FrontendOrigins))
	r.Use(middleware.OriginCheck(cfg.FrontendOrigins))

	routes.Register(r, db, cfg)

	// Vercel (and most hosts) inject PORT; locally it defaults to 8080.
	log.Printf("zen-habits backend listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
