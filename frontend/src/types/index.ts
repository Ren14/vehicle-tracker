export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Vehicle {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  license_plate: string
  created_at: string
}

export type MaintenanceCategory = 'service' | 'alineacion_balanceo' | 'otros'

export interface MaintenanceRecord {
  id: string
  vehicle_id: string
  date: string
  km: number
  description: string
  mechanic: string
  cost: number
  category: MaintenanceCategory
  created_at: string
}

export interface MaintenanceRecordPayload {
  date: string
  km: number
  description: string
  mechanic: string
  cost: number
  category: MaintenanceCategory
}
