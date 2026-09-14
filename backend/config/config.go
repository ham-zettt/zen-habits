package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config holds every environment-driven setting the app needs.
type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	FrontendURL     string
	FrontendOrigins []string
	GinMode         string
	DBLogLevel      string
	DBMaxOpenConns  int
	DBMaxIdleConns  int
	DBConnMaxLife   time.Duration
	RunMigrations   bool
	AccessTTL       time.Duration
	RefreshTTL      time.Duration
	CookieSecure    bool
}

// Load reads .env (if present) and the process environment, applying
// development-friendly defaults for anything missing.
//
// Values already present in the environment (e.g. Vercel project settings)
// take precedence over .env, so the same binary runs locally and in
// production.
func Load() (*Config, error) {
	_ = godotenv.Load()

	frontendURL := env("FRONTEND_URL", "http://localhost:3000")

	cfg := &Config{
		Port:            env("PORT", "8080"),
		DatabaseURL:     env("DATABASE_URL", "host=localhost port=5432 user=postgres password='' dbname=zenhabits-v2 sslmode=disable"),
		JWTSecret:       env("JWT_SECRET", "dev-local-secret-change-me-32bytes-minimum!!"),
		FrontendURL:     frontendURL,
		FrontendOrigins: splitOrigins(frontendURL),
		GinMode:         env("GIN_MODE", "debug"),
		DBLogLevel:      env("DB_LOG_LEVEL", "warn"),
		DBMaxOpenConns:  envInt("DB_MAX_OPEN_CONNS", 10),
		DBMaxIdleConns:  envInt("DB_MAX_IDLE_CONNS", 5),
		DBConnMaxLife:   envDuration("DB_CONN_MAX_LIFETIME", time.Hour),
		RunMigrations:   env("RUN_MIGRATIONS", "true") == "true",
		AccessTTL:       envDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTTL:      envDuration("REFRESH_TOKEN_TTL", 30*24*time.Hour),
		CookieSecure:    env("COOKIE_SECURE", "false") == "true",
	}

	return cfg, nil
}

// ConnectDB opens a GORM connection using the PostgreSQL driver and applies
// pool limits. Serverless platforms open many short-lived instances, so the
// limits are deliberately conservative and configurable.
func ConnectDB(cfg *Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel(cfg.DBLogLevel)),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(cfg.DBMaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.DBMaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.DBConnMaxLife)

	return db, nil
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

func splitOrigins(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	if n, err := strconv.Atoi(v); err == nil {
		return n
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
