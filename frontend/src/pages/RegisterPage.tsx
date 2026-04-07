import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Link, Paper, TextField, Typography,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/vehicles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" textAlign="center" mb={3} fontWeight={600}>
          Crear cuenta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
          <Typography textAlign="center" variant="body2">
            ¿Ya tenés cuenta?{' '}
            <Link component={RouterLink} to="/login">
              Iniciar sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
