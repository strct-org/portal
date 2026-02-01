package utils

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/strct-org/portal/backend/internal/types/user"
)

type QueryRower interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

func GetUserByClerkID(ctx context.Context, db QueryRower, clerkID string) (*user.User, error) {
	query := `
	SELECT id, clerk_id, email, username, first_name, last_name, image_url, email_verified, created_at, updated_at
	FROM users
	WHERE clerk_id = $1
	`

	u := &user.User{}
	err := db.QueryRow(ctx, query, clerkID).Scan(
		&u.ID,
		&u.ClerkID,
		&u.Email,
		&u.Username,
		&u.FirstName,
		&u.LastName,
		&u.ImageURL,
		&u.EmailVerified,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return u, nil
}