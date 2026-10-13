import { useThemeStore } from '../store/useThemeStore'

export const Footer = () => {
  const { theme } = useThemeStore()
  
  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md mt-auto`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <p className={`mt-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} Quizy Verse.
          </p>
        </div>
      </div>
    </footer>
  )
}