export function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatCost(cost: number): string {
  if (cost === 0) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(cost)
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat('es-AR').format(km) + ' km'
}

/** ISO string → "YYYY-MM-DD" for <input type="date"> */
export function toInputDate(isoDate: string): string {
  return isoDate.split('T')[0]
}
