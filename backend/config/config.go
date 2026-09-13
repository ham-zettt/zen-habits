package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config holds every environment-driven setting the app needs.
type Config struct {
	Port         string
	DatabaseURL  string
	JWTSecret    string
	FrontendURL  string
	GinMode      string
	DBLogLevel   string
	AccessTTL    time.Duration
	RefreshTTL   time.Duration
	CookieSecure bool
}

// Load reads .env (if present) and the process environment, applying
// development-friendly defaults for anything missing.
func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:         env("PORT", "8080"),
		DatabaseURL:  env("DATABASE_URL", "host=localhost port=5432 user=postgres password='' dbname=zenhabits-v2 sslmode=disable"),
		JWTSecret:    env("JWT_SECRET", "dev-local-secret-change-me-32bytes-minimum!!"),
		FrontendURL:  env("FRONTEND_URL", "http://localhost:3000"),
		GinMode:      env("GIN_MODE", "debug"),
		DBLogLevel:   env("DB_LOG_LEVEL", "warn"),
		AccessTTL:    envDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTTL:   envDuration("REFRESH_TOKEN_TTL", 30*24*time.Hour),
		CookieSecure: env("COOKIE_SECURE", "false") == "true",
	}

	return cfg, nil
}

// ConnectDB opens a GORM connection using the PostgreSQL driver.
func ConnectDB(dsn string, logLevel string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel(logLevel)),
	})
}

func gormLogLevel(level string) logger.LogLevel {
	switch level {
	case "silent":
		return logger.Silent
	case "error":
		return logger.Error
	case "info":
		return logger.Info
	default:
		return logger.Warn
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envDuration(key string, fallback time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	if d, err := time.ParseDuration(v); err == nil {
		return d
	}
	if seconds, err := strconv.Atoi(v); err == nil {
		return time.Duration(seconds) * time.Second
	}
	return fallback
}
