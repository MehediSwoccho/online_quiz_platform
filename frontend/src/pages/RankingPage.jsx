import { useState, useEffect } from 'react'
import { axiosInstance } from '../lib/axios'
import { authStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'

export const RankingPage = () => {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { authUser } = authStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('/rankings/overall')
        setRankings(response.data.rankings)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching rankings:', error)
        setError('Failed to load rankings. Please try again later.')
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  // Highlight the current user in the rankings
  const isCurrentUser = (studentId) => {
    return authUser && authUser._id === studentId
  }

  return (
    <div className="max-w-4xl mx-auto">
    <div className="ABC"></div>
      <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Student Rankings
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quizzes Attempted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rankings.length > 0 ? (
                  rankings.map((student) => (
                    <tr 
                      key={student._id} 
                      className={`${isCurrentUser(student._id) ? 'bg-blue-50 dark:bg-blue-900' : ''} hover:bg-gray-50 dark:hover:bg-gray-700`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {student.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {student.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {student.totalScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {student.totalAttempts}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No ranking data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">How Rankings Work</h2>
        <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Rankings are based on the total score across all quizzes</li>
          <li>New students start with zero points at the bottom of the ranking</li>
          <li>Your score and rank will update after completing quizzes</li>
          <li>Higher scores move you up in the rankings</li>
        </ul>
      </div>
    </div>
  )
}