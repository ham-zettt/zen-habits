package middleware

import "testing"

func TestOriginAllowed(t *testing.T) {
	patterns := []string{
		"http://localhost:3000",
		"https://zenhabits.vercel.app",
		"https://*.vercel.app",
	}

	tests := []struct {
		name   string
		origin string
		want   bool
	}{
		{name: "exact local", origin: "http://localhost:3000", want: true},
		{name: "exact production", origin: "https://zenhabits.vercel.app", want: true},
		{name: "preview wildcard", origin: "https://zen-habits-git-main-user.vercel.app", want: true},
		{name: "trailing slash tolerated", origin: "http://localhost:3000/", want: true},
		{name: "case insensitive", origin: "HTTP://LOCALHOST:3000", want: true},
		{name: "different port", origin: "http://localhost:3001", want: false},
		{name: "lookalike host", origin: "https://zenhabits.vercel.app.evil.com", want: false},
		{name: "unrelated host", origin: "https://evil.com", want: false},
		{name: "empty", origin: "", want: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := OriginAllowed(test.origin, patterns); got != test.want {
				t.Fatalf("OriginAllowed(%q) = %v, want %v", test.origin, got, test.want)
			}
		})
	}
}

func TestOriginAllowedWildcardAll(t *testing.T) {
	if !OriginAllowed("https://anything.example", []string{"*"}) {
		t.Fatal("wildcard * should allow any origin")
	}
}
