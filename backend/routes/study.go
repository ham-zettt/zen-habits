package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerStudyRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	studyController := controllers.NewStudyController(services.NewStudyService(db))

	plans := api.Group("/study-plans", middleware.Auth(cfg.JWTSecret))
	plans.GET("", studyController.List)
	plans.POST("", studyController.Create)
	plans.PATCH("/:id", studyController.Update)
	plans.PATCH("/:id/toggle", studyController.Toggle)
	plans.DELETE("/:id", studyController.Delete)
	plans.POST("/:id/links", studyController.AddLink)

	links := api.Group("/study-links", middleware.Auth(cfg.JWTSecret))
	links.DELETE("/:id", studyController.DeleteLink)
}
