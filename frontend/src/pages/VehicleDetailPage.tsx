import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, MenuItem, Paper,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography, InputLabel, FormControl,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BuildIcon from '@mui/icons-material/Build'
import EventIcon from '@mui/icons-material/Event'
import SpeedIcon from '@mui/icons-material/Speed'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { exportVehiclePdf } from '../utils/exportPdf'
import { vehiclesApi } from '../api/vehicles'
import type { Vehicle, MaintenanceRecord, MaintenanceRecordPayload, MaintenanceCategory } from '../types'
import { formatDate, formatCost, formatKm, toInputDate } from '../utils/format'

// ── Category helpers ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  service:             'Service',
  alineacion_balanceo: 'Alineación y Balanceo',
  otros:               'Otros',
}

const CATEGORY_COLORS: Record<MaintenanceCategory, 'primary' | 'warning' | 'default'> = {
  service:             'primary',
  alineacion_balanceo: 'warning',
  otros:               'default',
}

// ── Next-service calculations ──────────────────────────────────────────────────

interface NextServiceInfo {
  km: number
  date: Date
}

function calcNextService(records: MaintenanceRecord[]): NextServiceInfo | null {
  const last = records.find(r => r.category === 'service')
  if (!last) return null
  const lastDate = new Date(last.date)
  const nextDate = new Date(lastDate)
  nextDate.setFullYear(nextDate.getFullYear() + 1)
  return { km: last.km + 10000, date: nextDate }
}

function calcNextAlignment(records: MaintenanceRecord[]): number | null {
  const last = records.find(r => r.category === 'alineacion_balanceo')
  if (!last) return null
  return last.km + 10000
}

// ── Empty form ─────────────────────────────────────────────────────────────────

type FormState = Omit<MaintenanceRecordPayload, 'km' | 'cost'> & {
  km: string
  cost: string
}

const emptyForm: FormState = {
  date:        '',
  km:          '',
  description: '',
  mechanic:    '',
  cost:        '',
  category:    'otros',
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Dialog
  const [open, setOpen]           = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm]           = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadRecords = async () => {
    if (!id) return
    try {
      setRecords(await vehiclesApi.listMaintenance(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros')
    }
  }

  useEffect(() => {
    if (!id) return
    const init = async () => {
      try {
        const [allVehicles, recs] = await Promise.all([
          vehiclesApi.list(),
          vehiclesApi.listMaintenance(id),
        ])
        const found = allVehicles.find(v => v.id === id)
        if (!found) { navigate('/vehicles'); return }
        setVehicle(found)
        setRecords(recs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setOpen(true)
  }

  const openEdit = (rec: MaintenanceRecord) => {
    setEditingId(rec.id)
    setForm({
      date:        toInputDate(rec.date),
      km:          String(rec.km),
      description: rec.description,
      mechanic:    rec.mechanic,
      cost:        rec.cost > 0 ? String(rec.cost) : '',
      category:    rec.category,
    })
    setFormError('')
    setOpen(true)
  }

  const buildPayload = (): MaintenanceRecordPayload | null => {
    if (!form.date || !form.km || !form.description || !form.mechanic) {
      setFormError('Fecha, KM, descripción y mecánico son obligatorios')
      return null
    }
    return {
      date:        form.date,
      km:          parseInt(form.km),
      description: form.description,
      mechanic:    form.mechanic,
      cost:        parseFloat(form.cost) || 0,
      category:    form.category,
    }
  }

  const handleSave = async () => {
    setFormError('')
    const payload = buildPayload()
    if (!payload || !id) return
    setSaving(true)
    try {
      if (editingId) {
        await vehiclesApi.updateMaintenance(id, editingId, payload)
      } else {
        await vehiclesApi.createMaintenance(id, payload)
      }
      setOpen(false)
      loadRecords()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !id) return
    setDeleting(true)
    try {
      await vehiclesApi.deleteMaintenance(id, deleteId)
      setDeleteId(null)
      loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!vehicle) return null

  const nextService   = calcNextService(records)
  const nextAlignment = calcNextAlignment(records)

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'center' },
        mb: 2,
        gap: 2,
      }}>
        {/* Back + vehicle title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 0, md: 0 }, minWidth: 160 }}>
          <IconButton onClick={() => navigate('/vehicles')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={600} noWrap>
              {vehicle.make} {vehicle.model}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {vehicle.year} · Patente: {vehicle.license_plate}
            </Typography>
          </Box>
        </Box>

        {/* Buttons — below title on mobile, right on desktop */}
        <Box sx={{ order: { xs: 1, md: 3 }, display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => exportVehiclePdf(vehicle, records)}
            disabled={records.length === 0}
            sx={{ whiteSpace: 'nowrap', flex: { xs: 1, md: 'none' } }}
          >
            Exportar PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ whiteSpace: 'nowrap', flex: { xs: 1, md: 'none' } }}
          >
            Agregar registro
          </Button>
        </Box>

        {/* Calculated alerts — centre on desktop, below button on mobile */}
        <Box sx={{
          order: { xs: 2, md: 1 },
          flex: { md: 1 },
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}>
          {nextService && (
            <Paper
              variant="outlined"
              sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderColor: 'primary.main' }}
            >
              <SpeedIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="caption" color="primary" fontWeight={700} display="block">
                  Próximo service
                </Typography>
                <Typography variant="body2">
                  {formatKm(nextService.km)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 12 }} />
                  {formatDate(nextService.date.toISOString())}
                </Typography>
              </Box>
            </Paper>
          )}

          {nextAlignment !== null && (
            <Paper
              variant="outlined"
              sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderColor: 'warning.main' }}
            >
              <SpeedIcon color="warning" fontSize="small" />
              <Box>
                <Typography variant="caption" color="warning.main" fontWeight={700} display="block">
                  Próxima alineación
                </Typography>
                <Typography variant="body2">
                  {formatKm(nextAlignment)}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Table ── */}
      {records.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
          <BuildIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">Sin registros de mantenimiento</Typography>
          <Typography variant="body2">Hacé clic en "Agregar registro" para empezar</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Fecha</TableCell>
                <TableCell>KM</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Categoría</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Mecánico</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Costo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(rec => (
                <TableRow key={rec.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(rec.date)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatKm(rec.km)}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip
                      label={CATEGORY_LABELS[rec.category] ?? rec.category}
                      color={CATEGORY_COLORS[rec.category] ?? 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2">{rec.description}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {rec.mechanic}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>
                    {formatCost(rec.cost)}
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(rec)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(rec.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Dialog: crear / editar ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar registro' : 'Nuevo registro de mantenimiento'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Fecha"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="KM"
              type="number"
              value={form.km}
              onChange={e => setForm(f => ({ ...f, km: e.target.value }))}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
          </Box>

          <FormControl fullWidth required>
            <InputLabel>Categoría</InputLabel>
            <Select
              label="Categoría"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as MaintenanceCategory }))}
            >
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="alineacion_balanceo">Alineación y Balanceo</MenuItem>
              <MenuItem value="otros">Otros</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Descripción"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            required
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Mecánico / Taller"
              value={form.mechanic}
              onChange={e => setForm(f => ({ ...f, mechanic: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Costo ($)"
              type="number"
              value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: confirmar eliminación ── */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar registro</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que querés eliminar este registro? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
