import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user?.role !== allowedRole) {
    const fallback = user?.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}
