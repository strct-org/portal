package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/strct-org/portal/backend/internal/services"
	"github.com/strct-org/portal/backend/internal/types/device"
	"github.com/strct-org/portal/backend/middleware"
	"github.com/strct-org/portal/backend/utils"
)

type DeviceHandler struct {
	deviceService *services.DeviceService
}

func NewDeviceHandler(deviceService *services.DeviceService) *DeviceHandler {
	return &DeviceHandler{
		deviceService: deviceService,
	}
}

func (h *DeviceHandler) GetDevices(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	clerkID, ok := middleware.GetClerkID(ctx)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	devices, err := h.deviceService.GetDevices(ctx, clerkID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Filed to get devices")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, devices)
}

func (h *DeviceHandler) ClaimDevice(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	clerkID, ok := middleware.GetClerkID(ctx)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req device.ClaimDeviceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("ClaimDevice Handler: Failed to decode request body: %v", err)
		utils.RespondWithJSON(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	success, err := h.deviceService.ClaimDevice(ctx, clerkID, req.SerialNumber, req.ClaimToken, req.FriendlyName)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Failed to claim device")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, success)
}

func (h *DeviceHandler) GetParams(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	clerkID, ok := middleware.GetClerkID(ctx)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	deviceId := r.URL.Query().Get("device_id")

	params, err := h.deviceService.GetParams(ctx, clerkID, deviceId)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Failed to get device params")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, params)
}

func (h *DeviceHandler) UpdateParams(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var req device.ParamsUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("UpdateParams Handler: Failed to decode request body: %v", err)
		utils.RespondWithJSON(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	params, err := h.deviceService.UpdateParams(ctx, req)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Failed to update device params")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, params)
}
