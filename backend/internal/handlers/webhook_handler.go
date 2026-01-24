package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/strct-org/portal/backend/internal/services"
	"github.com/strct-org/portal/backend/internal/types/clerk"
	"github.com/strct-org/portal/backend/internal/types/user"

	svix "github.com/svix/svix-webhooks/go"
)

type WebhookHandler struct {
	userService *services.UserService
}

func NewWebhookHandler(userService *services.UserService) *WebhookHandler {
	return &WebhookHandler{
		userService: userService,
	}
}

func (h *WebhookHandler) HandleClerkWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading webhook body: %v", err)
		http.Error(w, "Error reading body", http.StatusBadRequest)
		return
	}

	if !h.verifyWebhookSignature(r.Header, payload) {
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	var event clerk.ClerkWebhookEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		log.Printf("Error parsing webhook JSON: %v", err)
		http.Error(w, "Error parsing webhook", http.StatusBadRequest)
		return
	}

	log.Printf("Received webhook event: %s", event.Type)

	ctx := r.Context()

	switch event.Type {
	case "user.created":
		if err := h.handleUserCreated(ctx, event.Data); err != nil {
			log.Printf("Error handling user.created: %v", err)
			http.Error(w, "Error processing webhook", http.StatusInternalServerError)
			return
		}

	// case "user.updated":
	// 	if err := h.handleUserUpdated(ctx, event.Data); err != nil {
	// 		log.Printf("Error handling user.updated: %v", err)
	// 		http.Error(w, "Error processing webhook", http.StatusInternalServerError)
	// 		return
	// 	}

	case "user.deleted":
		if err := h.handleUserDeleted(ctx, event.Data); err != nil {
			log.Printf("Error handling user.deleted: %v", err)
			http.Error(w, "Error processing webhook", http.StatusInternalServerError)
			return
		}

	default:
		log.Printf("Unhandled webhook event type: %s", event.Type)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

func (h *WebhookHandler) verifyWebhookSignature(headers http.Header, payload []byte) bool {
	secret := os.Getenv("CLERK_WEBHOOK_SECRET")
	if secret == "" {
		log.Println("WARNING: CLERK_WEBHOOK_SECRET not set. Skipping verification (Unsafe for production!)")
		return true // Allow in dev if secret is missing, strictly meant for testing
	}

	wh, err := svix.NewWebhook(secret)
	if err != nil {
		log.Printf("Failed to initialize Svix webhook verifier: %v", err)
		return false
	}

	err = wh.Verify(payload, headers)
	if err != nil {
		log.Printf("Webhook signature verification failed: %v", err)
		return false
	}

	return true
}
func (h *WebhookHandler) handleUserCreated(ctx context.Context, data json.RawMessage) error {
	var userData clerk.ClerkUserData
	if err := json.Unmarshal(data, &userData); err != nil {
		return fmt.Errorf("failed to unmarshal user data: %w", err)
	}

	// 1. Extract Email
	email := ""
	emailVerified := false
	if len(userData.EmailAddresses) > 0 {
		email = userData.EmailAddresses[0].EmailAddress
		emailVerified = userData.EmailAddresses[0].Verification.Status == "verified"
	}

	if email == "" {
		return fmt.Errorf("no email found for user %s", userData.ID)
	}

	// 2. Safely Dereference Pointers
	// The JSON says "first_name": "Martin", so this will work.
	firstName := ""
	if userData.FirstName != nil {
		firstName = *userData.FirstName
	}

	lastName := ""
	if userData.LastName != nil {
		lastName = *userData.LastName
	}

	// 3. Username Logic
	// The JSON explicitly says "username": NULL
	username := ""
	if userData.Username != nil {
		username = *userData.Username
	}

	// Since it is null, we MUST generate one to satisfy DB constraints
	if username == "" {
		if firstName != "" || lastName != "" {
			// Result: "MartinKovachki"
			username = fmt.Sprintf("%s%s", firstName, lastName)
		} else {
			// Fallback: "martbul01@gmail.com" -> "martbul01"
			username = email 
		}
	}

	// 4. Image Logic
	imageURL := userData.ImageURL
	if imageURL == "" {
		imageURL = userData.ProfileImageURL
	}

	// 5. Build the Request object
	createReq := &user.CreateUserRequest{
		ClerkID:   userData.ID,
		Email:     email,
		Username:  username,
		FirstName: firstName,
		LastName:  lastName,
		ImageURL:  imageURL,
	}

	// 6. Insert into Database
	log.Printf("Inserting User: %s (Clerk: %s)", email, userData.ID)
	
	u, err := h.userService.CreateUser(ctx, createReq)
	if err != nil {
		log.Printf("DB Error: %v", err)
		return fmt.Errorf("failed to create user in database: %w", err)
	}

	// 7. Handle Email Verification Status
	if emailVerified {
		h.userService.UpdateEmailVerification(ctx, userData.ID, true)
	}

	log.Printf("Successfully created user: %s", u.ID)
	return nil
}

// func (h *WebhookHandler) handleUserUpdated(ctx context.Context, data json.RawMessage) error {
// 	var userData clerk.ClerkUserData
// 	if err := json.Unmarshal(data, &userData); err != nil {
// 		return fmt.Errorf("failed to unmarshal user data: %w", err)
// 	}

// 	username := userData.Username
// 	if username == "" {
// 		username = userData.FirstName + userData.LastName
// 	}

// 	imageURL := userData.ImageURL
// 	if imageURL == "" {
// 		imageURL = userData.ProfileImageURL
// 	}

// 	updateReq := &user.UpdateProfileRequest{
// 		Username:  username,
// 		FirstName: userData.FirstName,
// 		LastName:  userData.LastName,
// 		ImageURL:  imageURL,
// 	}

// 	_, err := h.userService.UpdateProfileByClerkID(ctx, userData.ID, updateReq)
// 	if err != nil {
// 		return fmt.Errorf("failed to update user: %w", err)
// 	}

// 	log.Printf("Successfully updated user: Clerk ID: %s", userData.ID)
// 	return nil
// }

func (h *WebhookHandler) handleUserDeleted(ctx context.Context, data json.RawMessage) error {
	var userData struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(data, &userData); err != nil {
		return fmt.Errorf("failed to unmarshal user data: %w", err)
	}

	if err := h.userService.DeleteUserByClerkID(ctx, userData.ID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	log.Printf("Successfully deleted user: Clerk ID: %s", userData.ID)
	return nil
}