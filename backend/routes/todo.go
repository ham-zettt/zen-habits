package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerTodoRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	todoController := controllers.NewTodoController(services.NewTodoService(db))

	todos := api.Group("/todos", middleware.Auth(cfg.JWTSecret))
	todos.GET("", todoController.List)
	todos.POST("", todoController.Create)
	todos.PATCH("/:id", todoController.Update)
	todos.PATCH("/:id/toggle", todoController.Toggle)
	todos.DELETE("/:id", todoController.Delete)
}
