import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VehiclesPage from './pages/VehiclesPage'
import VehicleDetailPage from './pages/VehicleDetailPage'

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
  },
  shape: { borderRadius: 8 },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <Layout><VehiclesPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles/:id"
              element={
                <ProtectedRoute>
                  <Layout><VehicleDetailPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/vehicles" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
