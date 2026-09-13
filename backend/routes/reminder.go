package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerReminderRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	reminderController := controllers.NewReminderController(services.NewReminderService(db))

	reminders := api.Group("/reminders", middleware.Auth(cfg.JWTSecret))
	reminders.GET("", reminderController.List)
	reminders.POST("", reminderController.Create)
	reminders.PATCH("/:id", reminderController.Update)
	reminders.DELETE("/:id", reminderController.Delete)
}
