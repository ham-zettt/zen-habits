package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
	"github.com/ham-zettt/zen-habits/controllers"
	"github.com/ham-zettt/zen-habits/middleware"
	"github.com/ham-zettt/zen-habits/services"
)

func registerAuthRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	authService := services.NewAuthService(db, cfg)
	authController := controllers.NewAuthController(authService, cfg)

	auth := api.Group("/auth")
	auth.POST("/register", authController.Register)
	auth.POST("/login", authController.Login)
	auth.POST("/refresh", authController.Refresh)
	auth.POST("/logout", authController.Logout)
	auth.GET("/me", middleware.Auth(cfg.JWTSecret), authController.Me)
}
