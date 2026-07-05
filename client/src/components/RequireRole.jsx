import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">Loading...</div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
