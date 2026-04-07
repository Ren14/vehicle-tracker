import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Vehicle, MaintenanceRecord } from '../types'
import { formatDate, formatCost, formatKm } from './format'

const CATEGORY_LABELS: Record<string, string> = {
  service:             'Service',
  alineacion_balanceo: 'Alineación y Balanceo',
  otros:               'Otros',
}

const PRIMARY = [21, 101, 192] as [number, number, number]

export function exportVehiclePdf(vehicle: Vehicle, records: MaintenanceRecord[]) {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.width

  // ── Header bar ────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Tracker — Registro de Mantenimiento', 14, 12)

  // ── Vehicle info ──────────────────────────────────────────────
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${vehicle.make} ${vehicle.model} ${vehicle.year}`, 14, 28)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 90, 90)
  doc.text(`Patente: ${vehicle.license_plate}`, 14, 35)

  // ── Next service / alignment ──────────────────────────────────
  const lastService   = records.find(r => r.category === 'service')
  const lastAlignment = records.find(r => r.category === 'alineacion_balanceo')

  let y = 44
  doc.setFontSize(9)

  if (lastService) {
    const nextKm   = lastService.km + 10000
    const nextDate = new Date(lastService.date)
    nextDate.setFullYear(nextDate.getFullYear() + 1)

    doc.setFillColor(232, 240, 254)
    doc.roundedRect(14, y - 5, 85, 12, 2, 2, 'F')
    doc.setTextColor(...PRIMARY)
    doc.setFont('helvetica', 'bold')
    doc.text('Próximo service:', 17, y + 1)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)
    doc.text(`${formatKm(nextKm)}  o  ${formatDate(nextDate.toISOString())}`, 55, y + 1)
    y += 16
  }

  if (lastAlignment) {
    const nextKm = lastAlignment.km + 10000

    doc.setFillColor(255, 243, 224)
    doc.roundedRect(14, y - 5, 85, 12, 2, 2, 'F')
    doc.setTextColor(230, 81, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Próxima alineación:', 17, y + 1)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)
    doc.text(formatKm(nextKm), 60, y + 1)
    y += 16
  }

  // ── Table ─────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'KM', 'Categoría', 'Descripción', 'Mecánico', 'Costo']],
    body: records.map(rec => [
      formatDate(rec.date),
      formatKm(rec.km),
      CATEGORY_LABELS[rec.category] ?? rec.category,
      rec.description,
      rec.mechanic,
      formatCost(rec.cost),
    ]),
    styles:      { fontSize: 8, cellPadding: 3 },
    headStyles:  { fillColor: PRIMARY, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 65 },
      4: { cellWidth: 28 },
      5: { cellWidth: 18, halign: 'right' },
    },
  })

  // ── Footer ────────────────────────────────────────────────────
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    const footerY = doc.internal.pageSize.height - 8
    doc.text(`Generado el ${formatDate(new Date().toISOString())}`, 14, footerY)
    doc.text(`Página ${i} de ${total}`, pageW - 14, footerY, { align: 'right' })
  }

  const filename = `${vehicle.make}_${vehicle.model}_${vehicle.year}_mantenimiento.pdf`
    .replace(/\s+/g, '_')
    .toLowerCase()

  doc.save(filename)
}
