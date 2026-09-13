package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerWorkSessionRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	workSessionController := controllers.NewWorkSessionController(services.NewWorkSessionService(db))

	sessions := api.Group("/work-sessions", middleware.Auth(cfg.JWTSecret))
	sessions.GET("", workSessionController.List)
	sessions.POST("/start", workSessionController.Start)
	sessions.PATCH("/:id/stop", workSessionController.Stop)
	sessions.DELETE("/:id", workSessionController.Delete)
}
