package handlers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/strct-org/portal/backend/internal/services"
	"github.com/strct-org/portal/backend/internal/types/clerk"
	"github.com/strct-org/portal/backend/internal/types/user"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkHandler struct {
	userService *services.UserService
}

func NewClerkHandler(userService *services.UserService) *ClerkHandler {
	return &ClerkHandler{
		userService: userService,
	}
}

func (h *ClerkHandler) HandleClerkWebhook(w http.ResponseWriter, r *http.Request) {
	log.Println("PERSISTING NEW USER TO DB FROM CLERK WEBHOOK")

	// 1. Get the Webhook Secret from ENV
	secret := os.Getenv("CLERK_WEBHOOK_SECRET")
	if secret == "" {
		log.Println("CRITICAL: CLERK_WEBHOOK_SECRET is not set")
		http.Error(w, "Server configuration error", http.StatusInternalServerError)
		return
	}

	// 2. Read the Request Body
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// 3. Verify the Webhook Signature using your Svix package
	// We pass the headers directly
	wh, err := svix.NewWebhook(secret)
	if err != nil {
		log.Printf("Error creating webhook verifier: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = wh.Verify(payload, r.Header)
	if err != nil {
		log.Printf("Webhook verification failed: %v", err)
		http.Error(w, "Invalid signature", http.StatusBadRequest)
		return
	}

	// 4. Parse the outer JSON event
	var event clerk.ClerkWebhookEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 5. Switch based on Event Type
	switch event.Type {
	case "user.created":
		h.handleUserCreated(event.Data)
	case "user.updated":
		h.handleUserUpdated(event.Data)
	case "user.deleted":
		h.handleUserDeleted(event.Data)
	default:
		// We return 200 for ignored events so Clerk doesn't retry
		log.Printf("Ignored event type: %s", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ClerkHandler) handleUserCreated(data json.RawMessage) {
	var clerkUser clerk.ClerkUserData
	if err := json.Unmarshal(data, &clerkUser); err != nil {
		log.Printf("Error parsing user data: %v", err)
		return
	}

	email := ""
	if len(clerkUser.EmailAddresses) > 0 {
		email = clerkUser.EmailAddresses[0].EmailAddress
	}

	username := ""
	if clerkUser.Username != nil {
		username = *clerkUser.Username
	} else {
		parts := strings.Split(email, "@")
		if len(parts) > 0 {
			username = parts[0]
		} else {
			username = "user_" + clerkUser.ID
		}
	}

	firstName := ""
	if clerkUser.FirstName != nil {
		firstName = *clerkUser.FirstName
	}
	lastName := ""
	if clerkUser.LastName != nil {
		lastName = *clerkUser.LastName
	}

	req := &user.CreateUserRequest{
		ClerkID:   clerkUser.ID,
		Email:     email,
		Username:  username, // Now populated even if null in Clerk
		FirstName: firstName,
		LastName:  lastName,
		ImageURL:  clerkUser.ImageURL,
	}

	_, err := h.userService.CreateUser(context.Background(), req)
	if err != nil {
		log.Printf("Failed to create user in DB: %v", err)
		// Note: We intentionally do not return an error to the HTTP caller (Clerk)
		// if it's a duplicate or logical error, to prevent Clerk from retrying endlessly.
		// Only panic/infrastructure errors should theoretically return 500.
	} else {
		log.Printf("User created successfully: %s", username)
	}
}

func (h *ClerkHandler) handleUserUpdated(data json.RawMessage) {
	var clerkUser clerk.ClerkUserData
	if err := json.Unmarshal(data, &clerkUser); err != nil {
		log.Printf("Error parsing user data: %v", err)
		return
	}

	// Construct Update Request
	// Note: We only set fields that are present
	req := &user.UpdateProfileRequest{
		ImageURL: clerkUser.ImageURL,
	}

	if clerkUser.Username != nil {
		req.Username = *clerkUser.Username
	}
	if clerkUser.FirstName != nil {
		req.FirstName = *clerkUser.FirstName
	}
	if clerkUser.LastName != nil {
		req.LastName = *clerkUser.LastName
	}

	_, err := h.userService.UpdateProfileByClerkID(context.Background(), clerkUser.ID, req)
	if err != nil {
		log.Printf("Failed to update user: %v", err)
	}
}

func (h *ClerkHandler) handleUserDeleted(data json.RawMessage) {
	type DeletedEvent struct {
		ID      string `json:"id"`
		Deleted bool   `json:"deleted"`
	}
	var delEvent DeletedEvent
	if err := json.Unmarshal(data, &delEvent); err != nil {
		log.Printf("Error parsing deleted event: %v", err)
		return
	}

	if delEvent.Deleted {
		err := h.userService.DeleteUserByClerkID(context.Background(), delEvent.ID)
		if err != nil {
			log.Printf("Failed to delete user: %v", err)
		}
	}
}
