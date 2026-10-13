import { useState } from 'react'
import { authStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'

export const SettingsPage = () => {
  const { authUser } = authStore()
  const { theme, toggleTheme } = useThemeStore()
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:text-white">
        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="mt-4 flex items-center justify-between">
              <span>Theme Mode</span>
              <button
                onClick={toggleTheme}
                className={`${
                  theme === 'dark' 
                    ? 'bg-indigo-600 justify-end' 
                    : 'bg-gray-200 justify-start'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                ></span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 dark:bg-gray-700 dark:border-gray-600"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="ml-2">
                  Receive notifications about new messages and updates
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="mt-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>Name: {authUser?.fullName}</p>
                <p>Email: {authUser?.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              More settings will be available soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}