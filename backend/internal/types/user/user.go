package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID `json:"id"            db:"id"`
	ClerkID       string    `json:"clerkId"       db:"clerk_id"`
	Email         string    `json:"email"         db:"email"`
	Username      string    `json:"username"      db:"username"`
	FirstName     string    `json:"firstName"     db:"first_name"`
	LastName      string    `json:"lastName"      db:"last_name"`
	ImageURL      *string   `json:"imageUrl"      db:"image_url"` 
	EmailVerified bool      `json:"emailVerified" db:"email_verified"`
	CreatedAt     time.Time `json:"createdAt"     db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt"     db:"updated_at"`
}

type CreateUserRequest struct {
	ClerkID   string `json:"clerkId" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=30"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	ImageURL  string `json:"imageUrl,omitempty"`
}

type UpdateProfileRequest struct {
	Username  string `json:"username,omitempty"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	ImageURL  string `json:"imageUrl,omitempty"`
}

