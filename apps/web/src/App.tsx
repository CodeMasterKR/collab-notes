import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import NotesPage from './pages/NotesPage'
import NotePage from './pages/NotePage'
import InvitePage from './pages/InvitePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  const { token, getMe } = useAuthStore()

  useEffect(() => {
    if (token) getMe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<Navigate to="/notes" />} />
        <Route path="/notes" element={<PrivateRoute><NotesPage /></PrivateRoute>} />
        <Route path="/notes/:id" element={<PrivateRoute><NotePage /></PrivateRoute>} />
        <Route path="/invite/:token" element={<PrivateRoute><InvitePage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}