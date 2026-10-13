import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { NotificationBell } from './NotificationBell'

export const Navbar = () => {
  const { authUser, logout, isCheckingAuth } = authStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
  }

  // Don't render navigation items while checking auth to prevent flashing
  const shouldShowNavItems = authUser && !isCheckingAuth
  const userType = authUser?.userType

  return (
    <nav className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Quizy Verse
            </Link>
          </div>
          
          <div className="flex items-center">
            {shouldShowNavItems ? (
              <>
                {(userType === 'teacher' || userType === 'student') && (
                  <Link
                    to="/classes"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Classes
                  </Link>
                )}
                {userType === 'teacher' && (
                  <Link
                    to="/consultations"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Consultations
                  </Link>
                )}
                {userType === 'student' && (
                  <>
                    <Link
                      to="/consultations"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Consultations
                    </Link>
                    <Link
                      to="/rankings"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Rankings
                    </Link>
                  </>
                )}
                {userType === 'parent' && (
                  <Link
                    to="/parent-dashboard"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <span>Settings</span>
                  {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </Link>
                <div className="ml-2 mr-4">
                  <NotificationBell />
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : !isCheckingAuth ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}