package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// OriginCheck is a lightweight CSRF guard for cookie-authenticated routes.
// Safe methods pass through. For state-changing requests, a browser-supplied
// Origin must match the configured frontend. Requests without an Origin
// (curl, mobile clients) are allowed, since they do not carry ambient cookies
// from another site.
func OriginCheck(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			c.Next()
			return
		}

		if origin := c.GetHeader("Origin"); origin != "" && origin != allowedOrigin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"message": "Request blocked",
			})
			return
		}

		c.Next()
	}
}
