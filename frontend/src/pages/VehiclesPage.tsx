import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Card, CardActionArea, CardContent,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, TextField, Typography, CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { vehiclesApi } from '../api/vehicles'
import type { Vehicle } from '../types'

const emptyForm = { make: '', model: '', year: '', license_plate: '' }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const data = await vehiclesApi.list()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar vehículos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleOpen = () => {
    setForm(emptyForm)
    setFormError('')
    setOpen(true)
  }

  const handleSubmit = async () => {
    setFormError('')
    if (!form.make || !form.model || !form.year || !form.license_plate) {
      setFormError('Todos los campos son obligatorios')
      return
    }
    const year = parseInt(form.year)
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      setFormError('Año inválido')
      return
    }
    setSaving(true)
    try {
      await vehiclesApi.create({ ...form, year })
      setOpen(false)
      load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear vehículo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Mis vehículos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Agregar vehículo
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {vehicles.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
          <DirectionsCarIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6">No tenés vehículos registrados</Typography>
          <Typography variant="body2">Hacé clic en "Agregar vehículo" para comenzar</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {vehicles.map(v => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <Card elevation={2}>
                <CardActionArea onClick={() => navigate(`/vehicles/${v.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        {v.make} {v.model}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Año: {v.year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patente: {v.license_plate}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog: nuevo vehículo */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar vehículo</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Marca"
            value={form.make}
            onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Modelo"
            value={form.model}
            onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Año"
            type="number"
            value={form.year}
            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            fullWidth
            inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
          />
          <TextField
            label="Patente"
            value={form.license_plate}
            onChange={e => setForm(f => ({ ...f, license_plate: e.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
