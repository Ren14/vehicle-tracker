import { api } from './client'
import type { Vehicle, MaintenanceRecord, MaintenanceRecordPayload } from '../types'

export const vehiclesApi = {
  list: () =>
    api.get<Vehicle[]>('/vehicles'),

  create: (data: { make: string; model: string; year: number; license_plate: string }) =>
    api.post<Vehicle>('/vehicles', data),

  listMaintenance: (vehicleId: string) =>
    api.get<MaintenanceRecord[]>(`/vehicles/${vehicleId}/maintenance`),

  createMaintenance: (vehicleId: string, data: MaintenanceRecordPayload) =>
    api.post<MaintenanceRecord>(`/vehicles/${vehicleId}/maintenance`, data),

  updateMaintenance: (vehicleId: string, recordId: string, data: MaintenanceRecordPayload) =>
    api.put<MaintenanceRecord>(`/vehicles/${vehicleId}/maintenance/${recordId}`, data),

  deleteMaintenance: (vehicleId: string, recordId: string) =>
    api.delete(`/vehicles/${vehicleId}/maintenance/${recordId}`),
}
