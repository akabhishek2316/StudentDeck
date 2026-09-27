import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  const currentUser = JSON.parse(
    localStorage.getItem('currentUser') || 'null'
  )

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute