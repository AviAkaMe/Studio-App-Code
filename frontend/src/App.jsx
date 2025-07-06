// Main application routing component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'

// Wrapper component that restricts access based on authentication
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) {
    // Not logged in → force to login
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but wrong role → send to their proper dashboard
    return <Navigate to={`/${user.role}`} replace />
  }
  return children
}

export default function App() {
  const { user } = useAuth()
  console.log("🔐 user in App:", user)
  console.log("🌐 current path:", window.location.pathname)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: only for logged-out users */}
        <Route
          path="/login"
          element={
            !user
              ? <LoginForm />
              : <Navigate to={`/${user.role}`} replace />
          }
        />
        <Route
          path="/signup"
          element={
            !user
              ? <SignupForm />
              : <Navigate to={`/${user.role}`} replace />
          }
        />

        {/* Protected dashboards */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all: send everyone either to their dashboard or to login */}
        <Route
          path="*"
          element={
            <Navigate to={user ? `/${user.role}` : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}