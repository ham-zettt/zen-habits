package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashToken returns the SHA-256 hex digest of a token string. Refresh tokens
// are stored as hashes so a database leak cannot be replayed.
func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
