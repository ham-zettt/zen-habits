package services

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// mustUUID parses a UUID string, returning the nil UUID when invalid. Callers
// only pass IDs that originate from a validated JWT claim.
func mustUUID(value string) uuid.UUID {
	id, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil
	}
	return id
}

// isNotFound reports whether a repository lookup missed.
func isNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
