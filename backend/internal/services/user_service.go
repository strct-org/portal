package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/strct-org/portal/backend/internal/types/user"
	"github.com/strct-org/portal/backend/utils"
)

type UserService struct {
	db *pgxpool.Pool
}

func NewUserService(db *pgxpool.Pool) *UserService {
	return &UserService{
		db: db,
	}
}

func (s *UserService) CreateUser(ctx context.Context, req *user.CreateUserRequest) (*user.User, error) {
	newID := uuid.New().String()

	query := `
	INSERT INTO users (id, clerk_id, email, username, first_name, last_name, image_url, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
	ON CONFLICT (clerk_id) DO NOTHING 
	RETURNING id, clerk_id, email, username, first_name, last_name, image_url, email_verified, created_at, updated_at
	`

	u := &user.User{}

	err := s.db.QueryRow(
		ctx,
		query,
		newID,
		req.ClerkID,
		req.Email,
		req.Username,
		req.FirstName,
		req.LastName,
		req.ImageURL,
	).Scan(
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
		if err == pgx.ErrNoRows {
			return utils.GetUserByClerkID(ctx, s.db, req.ClerkID)
		}
		return nil, fmt.Errorf("db insert error: %w", err)
	}

	return u, nil
}

func (s *UserService) UpdateEmailVerification(ctx context.Context, clerkID string, verified bool) error {
	query := `
	UPDATE users
	SET email_verified = $2, updated_at = NOW()
	WHERE clerk_id = $1
	`

	_, err := s.db.Exec(ctx, query, clerkID, verified)
	return err
}

func (s *UserService) UpdateProfileByClerkID(ctx context.Context, clerkID string, req *user.UpdateProfileRequest) (*user.User, error) {
	query := `
	UPDATE users
	SET 
		username = COALESCE(NULLIF($2, ''), username),
		first_name = COALESCE(NULLIF($3, ''), first_name),
		last_name = COALESCE(NULLIF($4, ''), last_name),
		image_url = COALESCE(NULLIF($5, ''), image_url),
		updated_at = NOW()
	WHERE clerk_id = $1
	RETURNING id, clerk_id, email, username, first_name, last_name, image_url, email_verified, created_at, updated_at
	`

	u := &user.User{}
	err := s.db.QueryRow(
		ctx,
		query,
		clerkID,
		req.Username,
		req.FirstName,
		req.LastName,
		req.ImageURL,
	).Scan(
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
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return u, nil
}

func (s *UserService) DeleteUserByClerkID(ctx context.Context, clerkID string) error {
	query := `DELETE FROM users WHERE clerk_id = $1`

	result, err := s.db.Exec(ctx, query, clerkID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}


func (s *UserService) GetUserByClerkID(ctx context.Context, clerkID string) (*user.User, error) {
	return utils.GetUserByClerkID(ctx, s.db, clerkID)
}