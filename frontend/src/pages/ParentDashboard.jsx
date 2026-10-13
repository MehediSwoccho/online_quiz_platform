import { useState, useEffect } from 'react';
import { useParentStore } from '../store/useParentStore';
import { authStore } from '../store/useAuthStore';

export const ParentDashboard = () => {
  const { authUser } = authStore();
  const { 
    quizResults, 
    notifications, 
    loading, 
    error, 
    studentInfo,
    getQuizResults, 
    getNotifications,
    clearError 
  } = useParentStore();
  
  const [activeTab, setActiveTab] = useState('results');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    console.log('ParentDashboard useEffect - authUser:', authUser);
    if (authUser?.userType === 'parent') {
      console.log('Calling getQuizResults and getNotifications');
      getQuizResults();
      getNotifications();
    }
  }, [authUser, getQuizResults, getNotifications]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 30) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '👍';
    if (percentage >= 30) return '⚠️';
    return '🚨';
  };

  // Debug logging
  console.log('ParentDashboard render - authUser:', authUser);
  console.log('ParentDashboard render - quizResults:', quizResults);
  console.log('ParentDashboard render - loading:', loading);
  console.log('ParentDashboard render - error:', error);

  if (authUser?.userType !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This page is only accessible to parent accounts.</p>
        </div>
      </div>
    );
  }

  if (loading && quizResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Parent Dashboard
          </h1>
          {studentInfo && (
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Monitoring {studentInfo.name}'s quiz performance
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Quiz Results ({quizResults.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Low Score Alerts ({notifications.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Quiz Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {quizResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Quiz Results Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your child hasn't completed any quizzes yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {result.quizTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {result.className} • {result.subject}
                        </p>
                      </div>
                      <span className="text-2xl">{getScoreIcon(result.percentage)}</span>
                    </div>

                    <div className="mb-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.percentage)}`}>
                        {result.percentage}% ({result.score}/{result.totalPoints})
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <p>Status: <span className="capitalize font-medium">{result.status}</span></p>
                      {result.completedAt && (
                        <p>Completed: {formatDate(result.completedAt)}</p>
                      )}
                    </div>

                    {result.isLowScore && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                        <div className="flex items-center">
                          <span className="text-red-500 mr-2">⚠️</span>
                          <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                            Low Score Alert
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Low Score Alerts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Great! Your child is performing well on all quizzes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🚨</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Low Score Alert
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(notification.percentage)}`}>
                              {notification.percentage}%
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {notification.subject}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(notification.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
