package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
)

type contextKey string

const UserIDKey contextKey = "userID" // Internal DB UUID
const ClerkIDKey contextKey = "clerkID" // Clerk String ID

// ClerkAuthMiddleware requires a valid JWT token
func ClerkAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		// Strip "Bearer " prefix
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			respondWithError(w, http.StatusUnauthorized, "Invalid authorization format. Use 'Bearer <token>'")
			return
		}

		// Verify the token using Clerk SDK
		// Ensure CLERK_SECRET_KEY is set in your .env file for this to work
		claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			log.Printf("Token verification failed: %v", err)
			respondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Store Clerk ID in context
		ctx := context.WithValue(r.Context(), ClerkIDKey, claims.Subject)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// OptionalAuthMiddleware checks for a token but doesn't block if missing
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader != "" {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			// Try to verify, but ignore errors if invalid
			claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{
				Token: token,
			})
			if err == nil {
				ctx := context.WithValue(r.Context(), ClerkIDKey, claims.Subject)
				r = r.WithContext(ctx)
			}
		}
		
		// Continue even if no token found
		next.ServeHTTP(w, r)
	})
}

func GetClerkID(ctx context.Context) (string, bool) {
	clerkID, ok := ctx.Value(ClerkIDKey).(string)
	return clerkID, ok
}

// Helper to extract Internal User ID from context
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write([]byte(fmt.Sprintf(`{"error": "%s"}`, message)))
}