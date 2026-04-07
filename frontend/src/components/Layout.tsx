import type { ReactNode } from 'react'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <DirectionsCarIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/vehicles')}
          >
            Vehicle Tracker
          </Typography>
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 2, opacity: 0.85 }}>
                {user.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Salir
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
