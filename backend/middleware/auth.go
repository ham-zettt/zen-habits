package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ham-zettt/zen-habits/utils"
)

// ContextUserID is the gin context key holding the authenticated user ID.
const ContextUserID = "userID"

// Auth requires a valid access-token cookie and stores the user ID on the
// request context.
func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("access_token")
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Authentication required",
			})
			return
		}

		claims, err := utils.ParseToken(secret, token, utils.TokenTypeAccess)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Authentication required",
			})
			return
		}

		c.Set(ContextUserID, claims.UserID)
		c.Next()
	}
}
