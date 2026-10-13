import { useState, useEffect } from 'react'
import { useAnalyticsStore } from '../store/useAnalyticsStore'
import { authStore } from '../store/useAuthStore'

export const AnalyticsSection = () => {
  const { authUser } = authStore()
  const { 
    overallAnalytics, 
    classAnalytics, 
    recentQuizzes, 
    monthlyTrends,
    loading, 
    error, 
    fetchStudentAnalytics 
  } = useAnalyticsStore()

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (authUser?.userType === 'student') {
      fetchStudentAnalytics()
    }
  }, [fetchStudentAnalytics, authUser?.userType])

  // Calculate pie chart data
  const getPieChartData = () => {
    if (!overallAnalytics) return []
    
    const { totalQuizMarks, totalQuizAttempts, averageScore } = overallAnalytics
    
    return [
      {
        label: 'Total Marks',
        value: totalQuizMarks,
        color: '#3B82F6', // blue
        percentage: totalQuizAttempts > 0 ? ((totalQuizMarks / (totalQuizAttempts * 100)) * 100).toFixed(1) : 0
      },
      {
        label: 'Total Attempts',
        value: totalQuizAttempts,
        color: '#10B981', // green
        percentage: 100
      },
      {
        label: 'Average Score',
        value: parseFloat(averageScore),
        color: '#F59E0B', // amber
        percentage: 100
      }
    ]
  }

  // Calculate pie chart angles
  const calculatePieChart = (data) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -90 // Start from top
    
    return data.map(item => {
      const percentage = total > 0 ? (item.value / total) : 0
      const startAngle = currentAngle
      const endAngle = currentAngle + (percentage * 360)
      
      const x1 = 100 + 80 * Math.cos(startAngle * Math.PI / 180)
      const y1 = 100 + 80 * Math.sin(startAngle * Math.PI / 180)
      const x2 = 100 + 80 * Math.cos(endAngle * Math.PI / 180)
      const y2 = 100 + 80 * Math.sin(endAngle * Math.PI / 180)
      
      const largeArcFlag = percentage > 0.5 ? 1 : 0
      
      const pathData = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      currentAngle = endAngle
      
      return {
        ...item,
        pathData,
        percentage: (percentage * 100).toFixed(1)
      }
    })
  }

  const pieChartData = getPieChartData()
  const calculatedPieChart = calculatePieChart(pieChartData)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6">
          <div className="text-center py-8">
            <div className="bg-red-100 p-4 inline-block rounded-full mb-4 dark:bg-red-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100">Error Loading Analytics</h3>
            <p className="text-gray-500 mb-4 dark:text-gray-400">{error}</p>
            <button 
              onClick={fetchStudentAnalytics}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!overallAnalytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6">
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 inline-block rounded-full mb-4 dark:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-100">No Analytics Data</h3>
            <p className="text-gray-500 dark:text-gray-400">Complete some quizzes to see your progress analytics.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Progress Analytics</h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 dark:bg-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Details
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/30">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Attempts</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{overallAnalytics.totalQuizAttempts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/30">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg dark:bg-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600 dark:text-green-300">Total Marks</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{overallAnalytics.totalQuizMarks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg dark:bg-amber-900/30">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-lg dark:bg-amber-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-300">Average Score</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{overallAnalytics.averageScore}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg dark:bg-purple-900/30">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg dark:bg-purple-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{overallAnalytics.averagePercentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-50 p-6 rounded-lg dark:bg-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center dark:text-white">Progress Overview</h3>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
                {/* SVG Pie Chart */}
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                    {calculatedPieChart.map((item, index) => (
                      <path
                        key={index}
                        d={item.pathData}
                        fill={item.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    ))}
                    <circle cx="100" cy="100" r="40" fill="white" />
                    <text x="100" y="105" textAnchor="middle" className="text-sm font-medium fill-gray-700 dark:fill-gray-300">
                      {overallAnalytics.totalQuizAttempts > 0 ? 'Active' : 'No Data'}
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {calculatedPieChart.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.value} ({item.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Class Performance */}
            {Object.values(classAnalytics).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Performance by Class</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(classAnalytics).map((classData) => (
                    <div key={classData.classId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h4 className="font-medium text-gray-800 mb-2 dark:text-white">{classData.className}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
                          <span className="font-medium dark:text-white">{classData.attempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Marks:</span>
                          <span className="font-medium dark:text-white">{classData.totalMarks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Average:</span>
                          <span className="font-medium dark:text-white">{classData.averageScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                          <span className="font-medium dark:text-white">{classData.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Quizzes */}
            {recentQuizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Recent Quiz Performance</h3>
                <div className="space-y-3">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.quizId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{quiz.quizTitle}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(quiz.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {quiz.score}/{quiz.totalPoints}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {quiz.percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {monthlyTrends.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Monthly Progress Trends</h3>
                <div className="space-y-3">
                  {monthlyTrends.map((trend) => (
                    <div key={trend.month} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trend.attempts} quiz{trend.attempts !== 1 ? 'es' : ''} attempted
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {trend.averageScore}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trend.percentage}% success
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

