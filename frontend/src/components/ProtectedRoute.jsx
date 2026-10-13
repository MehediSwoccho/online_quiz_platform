import { Navigate } from 'react-router-dom'
import { authStore } from '../store/useAuthStore'

export const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = authStore()

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return <Navigate to="/login" />
  }

  return children
}