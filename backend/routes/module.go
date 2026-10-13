package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerModuleRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	moduleController := controllers.NewModuleController(
		services.NewModuleService(db),
		services.NewModuleItemService(db),
	)

	modules := api.Group("/modules", middleware.Auth(cfg.JWTSecret))
	modules.GET("", moduleController.List)
	modules.POST("", moduleController.Create)
	modules.GET("/:id", moduleController.Get)
	modules.PUT("/:id", moduleController.Update)
	modules.DELETE("/:id", moduleController.Delete)

	modules.GET("/:id/items", moduleController.ListItems)
	modules.POST("/:id/items", moduleController.CreateItem)
	modules.PUT("/:id/items/:itemId", moduleController.UpdateItem)
	modules.PATCH("/:id/items/:itemId/done", moduleController.ToggleItem)
	modules.DELETE("/:id/items/:itemId", moduleController.DeleteItem)
}
