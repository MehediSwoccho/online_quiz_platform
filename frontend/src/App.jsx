import { Route, Routes } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Footer } from "./components/Footer"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { SettingsPage } from "./pages/SettingsPage"
import { ProfilePage } from "./pages/ProfilePage"
import { ClassesPage } from "./pages/ClassesPage" 
import { CreateClassPage } from "./pages/CreateClassPage"
import { EnrollClassPage } from "./pages/EnrollClassPage"
import { ClassDetailsPage } from "./pages/ClassDetailsPage"
import { ClassMarksPage } from "./pages/ClassMarksPage"
import { CreateQuizPage } from "./pages/CreateQuizPage"
import { QuizPage } from "./pages/QuizPage"
import { RankingPage } from "./pages/RankingPage"
import { ConsultationsPage } from "./pages/ConsultationsPage"
import { ParentDashboard } from './pages/ParentDashboard';
import { authStore } from "./store/useAuthStore"
import { useThemeStore } from "./store/useThemeStore"
import { useEffect, useState } from "react"

const App = () => {
  const { checkAuth, isCheckingAuth } = authStore()
  const { theme } = useThemeStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  console.log('App rendering - isInitialized:', isInitialized, 'isCheckingAuth:', isCheckingAuth)
  
  useEffect(() => {
    console.log('App useEffect - starting initialization')
    // Add error handling for the authentication check
    const initializeApp = async () => {
      try {
        console.log('Calling checkAuth...')
        await checkAuth()
        console.log('checkAuth completed successfully')
      } catch (error) {
        console.error('Error during authentication check:', error)
        // Continue with the app even if auth check fails
      } finally {
        console.log('Setting isInitialized to true')
        setIsInitialized(true)
      }
    }
    
    initializeApp()
  }, [checkAuth])
  
  useEffect(() => {
    console.log('Theme effect - applying theme:', theme)
    // Apply theme class to the document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  // Show loading screen while initializing
  if (!isInitialized || isCheckingAuth) {
    console.log('Showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Quiz System...</p>
        </div>
      </div>
    )
  }

  console.log('Rendering main app content')
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/classes" element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          } />
          <Route path="/create-class" element={
            <ProtectedRoute>
              <CreateClassPage />
            </ProtectedRoute>
          } />
          <Route path="/enroll-class" element={
            <ProtectedRoute>
              <EnrollClassPage />
            </ProtectedRoute>
          } />
          <Route path="/classes/:classId" element={
            <ProtectedRoute>
              <ClassDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/classes/:classId/marks" element={
            <ProtectedRoute>
              <ClassMarksPage />
            </ProtectedRoute>
          } />
          <Route path="/classes/:classId/create-quiz" element={
            <ProtectedRoute>
              <CreateQuizPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:quizId" element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } />
          <Route path="/rankings" element={
            <ProtectedRoute>
              <RankingPage />
            </ProtectedRoute>
          } />
          <Route path="/consultations" element={
            <ProtectedRoute>
              <ConsultationsPage />
            </ProtectedRoute>
          } />
          <Route path="/parent-dashboard" element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App