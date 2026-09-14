package middleware

import (
	"strings"
)

// OriginAllowed reports whether an Origin header matches any allowed pattern.
//
// Patterns may be:
//   - an exact origin, e.g. "https://zenhabits.vercel.app"
//   - "*" to allow any origin
//   - a host wildcard, e.g. "https://*.vercel.app" (useful for preview deploys)
func OriginAllowed(origin string, patterns []string) bool {
	origin = normalizeOrigin(origin)
	if origin == "" {
		return false
	}

	for _, pattern := range patterns {
		p := normalizeOrigin(pattern)
		if p == "" {
			continue
		}
		if p == "*" {
			return true
		}
		if strings.Contains(p, "*") {
			prefix, suffix, _ := strings.Cut(p, "*")
			if strings.HasPrefix(origin, prefix) && strings.HasSuffix(origin, suffix) {
				return true
			}
			continue
		}
		if origin == p {
			return true
		}
	}

	return false
}

func normalizeOrigin(value string) string {
	return strings.TrimRight(strings.ToLower(strings.TrimSpace(value)), "/")
}
