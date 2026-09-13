package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger prints one line per request with method, path, status, and latency.
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Printf("%s %s %d %s",
			c.Request.Method,
			c.Request.URL.RequestURI(),
			c.Writer.Status(),
			time.Since(start).Round(time.Millisecond),
		)
	}
}
