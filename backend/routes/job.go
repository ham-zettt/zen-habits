package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerJobRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	jobController := controllers.NewJobController(services.NewJobService(db))

	jobs := api.Group("/jobs", middleware.Auth(cfg.JWTSecret))
	jobs.GET("", jobController.List)
	jobs.POST("", jobController.Create)
	jobs.PATCH("/:id", jobController.Update)
	jobs.DELETE("/:id", jobController.Delete)
}
