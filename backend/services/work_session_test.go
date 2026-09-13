package services

import (
	"testing"
	"time"
)

func TestDurationSeconds(t *testing.T) {
	start := time.Date(2026, 1, 1, 9, 0, 0, 0, time.UTC)

	tests := []struct {
		name    string
		started time.Time
		ended   *time.Time
		want    int64
	}{
		{
			name:    "running session has no duration",
			started: start,
			ended:   nil,
			want:    0,
		},
		{
			name:    "ninety minutes",
			started: start,
			ended:   timePtr(start.Add(90 * time.Minute)),
			want:    5400,
		},
		{
			name:    "zero length",
			started: start,
			ended:   timePtr(start),
			want:    0,
		},
		{
			name:    "inverted timestamps clamp to zero",
			started: start,
			ended:   timePtr(start.Add(-time.Hour)),
			want:    0,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := durationSeconds(test.started, test.ended); got != test.want {
				t.Fatalf("durationSeconds() = %d, want %d", got, test.want)
			}
		})
	}
}

func timePtr(value time.Time) *time.Time {
	return &value
}
