import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '../store/useAuthStore'
import { useClassStore } from '../store/useClassStore'
import { useQuizStore } from '../store/useQuizStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { useThemeStore } from '../store/useThemeStore'
import { AnalyticsSection } from '../components/AnalyticsSection'
import { AIChatbot } from '../components/AIChatbot'

export const HomePage = () => {
  const navigate = useNavigate()
  const { authUser } = authStore()
  const { theme } = useThemeStore()
  const { 
    classes, 
    fetchClasses,
    loading: classesLoading 
  } = useClassStore()
  
  const { 
    fetchUpcomingQuizzes,
    upcomingQuizzes,
    loading: quizzesLoading 
  } = useQuizStore()
  
  const { notifications, fetchNotifications, loading: notificationsLoading } = useNotificationStore()
  
  const isTeacher = authUser?.userType === 'teacher'
  const isStudent = authUser?.userType === 'student'
  const isParent = authUser?.userType === 'parent'
  
  useEffect(() => {
    // Redirect parent users to their dashboard
    if (isParent) {
      navigate('/parent-dashboard')
      return
    }

    const loadData = async () => {
      await fetchClasses(authUser?.userType)
      
      if (isStudent) {
        await fetchUpcomingQuizzes()
      }
      
      await fetchNotifications(1, 5)
    }
    
    loadData()
  }, [fetchClasses, fetchUpcomingQuizzes, fetchNotifications, isStudent, isParent, authUser?.userType, navigate])
  
  const calculateTimeLeft = (startTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const diffMs = start - now
    
    if (diffMs <= 0) return 'Starting now'
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `Starts in ${diffDays}d ${diffHrs}h`
    }
    
    return diffHrs > 0 
      ? `Starts in ${diffHrs}h ${diffMins}m` 
      : `Starts in ${diffMins}m`
  }

  const isLoading = classesLoading || quizzesLoading || notificationsLoading

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Quizy Verse Banner */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-800 rounded-lg overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative py-10 px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 flex items-center">
            <div className="bg-white p-3 rounded-full shadow-md">
              <img 
                src="/quizy-verse-logo.svg" 
                alt="Quizy Verse" 
                className="h-16 w-16 object-contain" 
              />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white mb-1">Quizy Verse</h1>
              <p className="text-blue-100">Online assessment platform for students and faculty</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
              <p className="text-white font-medium">
                Welcome, {authUser?.fullName || 'User'}! 
              </p>
              <p className="text-blue-100 text-sm">
                {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Classes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Classes</h2>
                  <Link 
                    to="/classes" 
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View All
                  </Link>
                </div>
                
                {classes && classes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.slice(0, 4).map((cls) => (
                      <Link
                        key={cls._id}
                        to={`/classes/${cls._id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 dark:border-gray-600 dark:hover:border-blue-500"
                      >
                        <h3 className="font-semibold text-gray-800 mb-2 dark:text-white">{cls.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 dark:text-gray-400 line-clamp-2">
                          {cls.description}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>Enrollment Code: {cls.enrollmentCode}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-4 inline-block rounded-full mb-4 dark:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100">No Classes Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Enroll in classes to get started with your learning journey.</p>
                    <Link 
                      to="/enroll-class" 
                      className="inline-flex items-center px-4 py-2 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Enroll in Class
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Quizzes Section (Students Only) */}
            {isStudent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upcoming Quizzes</h2>
                    <Link 
                      to="/classes" 
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View All
                    </Link>
                  </div>
                  
                  {upcomingQuizzes && upcomingQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingQuizzes.slice(0, 3).map((quiz) => (
                        <div key={quiz._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">{quiz.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(quiz.startTime).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {calculateTimeLeft(quiz.startTime)}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/quiz/${quiz._id}`, { state: { classId: quiz.classId } })}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            Preview
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100">No Upcoming Quizzes</h3>
                      <p className="text-gray-500 dark:text-gray-400">You don't have any scheduled quizzes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {isStudent && (
              <div id="analytics-section">
                <AnalyticsSection />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
          
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Mark all as read
                  </button>
                </div>
                
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`p-3 rounded-lg ${
                          !notification.read 
                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <h4 className={`text-sm ${!notification.read ? 'font-semibold' : ''} dark:text-white`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{notification.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notification.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-4 inline-block rounded-full mb-4 dark:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100">No Notifications</h3>
                    <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot - Only for Students */}
      {isStudent && <AIChatbot />}
    </div>
  )
}