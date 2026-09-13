package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerFinanceRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	transactionController := controllers.NewTransactionController(services.NewTransactionService(db))
	wishlistController := controllers.NewWishlistController(services.NewWishlistService(db))

	transactions := api.Group("/transactions", middleware.Auth(cfg.JWTSecret))
	transactions.GET("", transactionController.List)
	transactions.GET("/summary", transactionController.Summary)
	transactions.POST("", transactionController.Create)
	transactions.PATCH("/:id", transactionController.Update)
	transactions.DELETE("/:id", transactionController.Delete)

	wishlist := api.Group("/wishlist", middleware.Auth(cfg.JWTSecret))
	wishlist.GET("", wishlistController.List)
	wishlist.POST("", wishlistController.Create)
	wishlist.PATCH("/:id", wishlistController.Update)
	wishlist.DELETE("/:id", wishlistController.Delete)
}
