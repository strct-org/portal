package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID `json:"id"            db:"id"`
	ClerkID       string    `json:"clerk_id"       db:"clerk_id"`
	Email         string    `json:"email"         db:"email"`
	Username      string    `json:"username"      db:"username"`
	FirstName     string    `json:"first_name"     db:"first_name"`
	LastName      string    `json:"last_name"      db:"last_name"`
	ImageURL      *string   `json:"image_url"      db:"image_url"`
	EmailVerified bool      `json:"email_verified" db:"email_verified"`
	CreatedAt     time.Time `json:"created_at"     db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"     db:"updated_at"`
}

type CreateUserRequest struct {
	ClerkID   string `json:"clerk_id" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=30"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	ImageURL  string `json:"imageUrl,omitempty"`
}

type UpdateProfileRequest struct {
	Username  string `json:"username,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	ImageURL  string `json:"image_url,omitempty"`
}
