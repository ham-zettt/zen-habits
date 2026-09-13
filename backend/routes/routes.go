package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/ham-zettt/zen-habits/config"
)

// Register wires every HTTP route onto the engine.
func Register(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	api := r.Group("/api")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	registerAuthRoutes(api, db, cfg)
	registerTodoRoutes(api, db, cfg)
	registerStudyRoutes(api, db, cfg)
	registerReminderRoutes(api, db, cfg)
	registerJobRoutes(api, db, cfg)
	registerWorkSessionRoutes(api, db, cfg)
	registerFinanceRoutes(api, db, cfg)
}
