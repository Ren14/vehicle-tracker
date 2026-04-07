package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/Ren14/vehicle-tracker/backend/internal/app"
	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type VehicleHandler struct {
	vehicleService *app.VehicleService
}

func NewVehicleHandler(vehicleService *app.VehicleService) *VehicleHandler {
	return &VehicleHandler{vehicleService: vehicleService}
}

func (h *VehicleHandler) ListVehicles(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	vehicles, err := h.vehicleService.GetVehiclesByUser(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list vehicles")
		return
	}

	dtos := make([]VehicleDTO, 0, len(vehicles))
	for _, v := range vehicles {
		dtos = append(dtos, vehicleToDTO(v))
	}
	writeJSON(w, http.StatusOK, dtos)
}

func (h *VehicleHandler) CreateVehicle(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateVehicleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Make == "" || req.Model == "" || req.Year == 0 || req.LicensePlate == "" {
		writeError(w, http.StatusBadRequest, "make, model, year, and license_plate are required")
		return
	}

	vehicle, err := h.vehicleService.CreateVehicle(r.Context(), userID, req.Make, req.Model, req.Year, req.LicensePlate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create vehicle")
		return
	}

	writeJSON(w, http.StatusCreated, vehicleToDTO(*vehicle))
}

func (h *VehicleHandler) ListMaintenanceRecords(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	vehicleID, err := uuid.Parse(chi.URLParam(r, "vehicleID"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid vehicle ID")
		return
	}

	records, err := h.vehicleService.ListMaintenanceRecords(r.Context(), vehicleID, userID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			writeError(w, http.StatusNotFound, "vehicle not found")
		case errors.Is(err, domain.ErrUnauthorized):
			writeError(w, http.StatusForbidden, "access denied")
		default:
			writeError(w, http.StatusInternalServerError, "failed to list maintenance records")
		}
		return
	}

	dtos := make([]MaintenanceRecordDTO, 0, len(records))
	for _, rec := range records {
		dtos = append(dtos, maintenanceRecordToDTO(rec))
	}
	writeJSON(w, http.StatusOK, dtos)
}

func (h *VehicleHandler) CreateMaintenanceRecord(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	vehicleID, err := uuid.Parse(chi.URLParam(r, "vehicleID"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid vehicle ID")
		return
	}

	var req CreateMaintenanceRecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Date == "" || req.Km == 0 || req.Description == "" || req.Mechanic == "" {
		writeError(w, http.StatusBadRequest, "date, km, description, and mechanic are required")
		return
	}

	date, ok := parseDate(w, req.Date)
	if !ok {
		return
	}

	category := normalizeCategory(req.Category)

	record, err := h.vehicleService.CreateMaintenanceRecord(
		r.Context(), vehicleID, userID,
		date, req.Km, req.Description, req.Mechanic, req.Cost, category,
	)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			writeError(w, http.StatusNotFound, "vehicle not found")
		case errors.Is(err, domain.ErrUnauthorized):
			writeError(w, http.StatusForbidden, "access denied")
		default:
			writeError(w, http.StatusInternalServerError, "failed to create maintenance record")
		}
		return
	}

	writeJSON(w, http.StatusCreated, maintenanceRecordToDTO(*record))
}

func (h *VehicleHandler) UpdateMaintenanceRecord(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	recordID, err := uuid.Parse(chi.URLParam(r, "recordID"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid record ID")
		return
	}

	var req CreateMaintenanceRecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Date == "" || req.Km == 0 || req.Description == "" || req.Mechanic == "" {
		writeError(w, http.StatusBadRequest, "date, km, description, and mechanic are required")
		return
	}

	date, ok := parseDate(w, req.Date)
	if !ok {
		return
	}

	category := normalizeCategory(req.Category)

	record, err := h.vehicleService.UpdateMaintenanceRecord(
		r.Context(), recordID, userID,
		date, req.Km, req.Description, req.Mechanic, req.Cost, category,
	)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			writeError(w, http.StatusNotFound, "record not found")
		case errors.Is(err, domain.ErrUnauthorized):
			writeError(w, http.StatusForbidden, "access denied")
		default:
			writeError(w, http.StatusInternalServerError, "failed to update maintenance record")
		}
		return
	}

	writeJSON(w, http.StatusOK, maintenanceRecordToDTO(*record))
}

func (h *VehicleHandler) DeleteMaintenanceRecord(w http.ResponseWriter, r *http.Request) {
	userID, ok := userIDFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	recordID, err := uuid.Parse(chi.URLParam(r, "recordID"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid record ID")
		return
	}

	if err := h.vehicleService.DeleteMaintenanceRecord(r.Context(), recordID, userID); err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			writeError(w, http.StatusNotFound, "record not found")
		case errors.Is(err, domain.ErrUnauthorized):
			writeError(w, http.StatusForbidden, "access denied")
		default:
			writeError(w, http.StatusInternalServerError, "failed to delete maintenance record")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func parseDate(w http.ResponseWriter, s string) (time.Time, bool) {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		writeError(w, http.StatusBadRequest, "date must be in YYYY-MM-DD format")
		return time.Time{}, false
	}
	return t, true
}

func normalizeCategory(c string) string {
	switch c {
	case domain.CategoryService, domain.CategoryAlignmentBalancing:
		return c
	default:
		return domain.CategoryOther
	}
}
