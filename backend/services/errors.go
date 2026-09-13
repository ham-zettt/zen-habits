package services

import "errors"

// Sentinel errors mapped to HTTP status codes by the controllers.
var (
	ErrEmailTaken         = errors.New("email already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrNotFound           = errors.New("not found")
	ErrValidation         = errors.New("validation failed")
	ErrConflict           = errors.New("conflict")
)
