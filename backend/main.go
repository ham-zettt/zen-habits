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

	db, err := config.ConnectDB(cfg.DatabaseURL, cfg.DBLogLevel)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	if err := db.AutoMigrate(models.AllModels()...); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	r := gin.New()
	r.Use(middleware.Logger(), gin.Recovery())
	r.Use(middleware.CORS(cfg.FrontendURL))
	r.Use(middleware.OriginCheck(cfg.FrontendURL))

	routes.Register(r, db, cfg)

	log.Printf("zen-habits backend listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
