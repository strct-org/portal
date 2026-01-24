package device

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	ID           string    `json:"id"           db:"id"`
	OwnerID      uuid.UUID `json:"ownerId"      db:"owner_id"`
	FriendlyName string    `json:"friendlyName" db:"friendly_name"`
	IsOnline     bool      `json:"isOnline"     db:"is_online"`
	LastSeen     time.Time `json:"lastSeen"     db:"last_seen"`
	LocalIP      string    `json:"localIp"      db:"local_ip"`
	Version      string    `json:"version"      db:"version"`
	CreatedAt    time.Time `json:"createdAt"    db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt"    db:"updated_at"`
}

type FileMetadata struct {
	ID       int64  `json:"id"           db:"id"`
	DeviceID string `json:"deviceId"     db:"device_id"`
	FileName string `json:"fileName"     db:"file_name"`
	FilePath string `json:"filePath"     db:"file_path"`
	FileType string `json:"fileType"     db:"file_type"`
	FileSize int64  `json:"fileSize"     db:"file_size"`

	IsStarred bool `json:"isStarred"    db:"is_starred"`

	CreatedAt time.Time `json:"createdAt"    db:"created_at"`
}
