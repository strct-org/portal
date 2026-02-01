package device

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	OwnerID      uuid.UUID `json:"owner_id"      db:"owner_id"`
	LastSeen     time.Time `json:"last_seen"     db:"last_seen"`
	CreatedAt    time.Time `json:"created_at"    db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"    db:"updated_at"`
	ID           string    `json:"id"            db:"id"`
	FriendlyName string    `json:"friendly_name" db:"friendly_name"`
	LocalIP      string    `json:"local_ip"      db:"local_ip"`
	Version      string    `json:"version"       db:"version"`
	IsOnline     bool      `json:"is_online"     db:"is_online"`
}

type Params struct {
	UpdatedAt time.Time `json:"updated_at"    db:"updated_at"`
	LastSeen  time.Time `json:"last_seen"     db:"last_seen"`
	LocalIP   string    `json:"local_ip"      db:"local_ip"`
	Version   string    `json:"version"      db:"version"`
	IsOnline  bool      `json:"is_online"     db:"is_online"`
}

type FileMetadata struct {
	ID        int64     `json:"id"           db:"id"`
	FileSize  int64     `json:"file_size"     db:"file_size"`
	CreatedAt time.Time `json:"created_at"    db:"created_at"`
	DeviceID  string    `json:"device_id"     db:"device_id"`
	FileName  string    `json:"file_name"     db:"file_name"`
	FilePath  string    `json:"file_path"     db:"file_path"`
	FileType  string    `json:"file_type"     db:"file_type"`
	IsStarred bool      `json:"is_starred"    db:"is_starred"`
}

type ClaimDeviceRequest struct {
	SerialNumber string `json:"serial_number,omitempty"`
	ClaimToken   string `json:"claim_token,omitempty"`
	FriendlyName string `json:"friendly_name,omitempty"`
}

type ParamsUpdate struct {
	LocalIP  string `json:"local_ip"`
	Version  string `json:"version"`
	IsOnline bool   `json:"is_online"`
}
