import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'

export const useAnalyticsStore = create((set, get) => ({
  // State
  overallAnalytics: null,
  classAnalytics: {},
  recentQuizzes: [],
  monthlyTrends: [],
  loading: false,
  error: null,

  // Actions
  fetchStudentAnalytics: async () => {
    try {
      set({ loading: true, error: null })
      
      const response = await axiosInstance.get('/analytics/student')
      
      set({
        overallAnalytics: response.data.overall,
        classAnalytics: response.data.byClass.reduce((acc, classData) => {
          acc[classData.classId] = classData
          return acc
        }, {}),
        recentQuizzes: response.data.recentQuizzes,
        monthlyTrends: response.data.monthlyTrends,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching student analytics:', error)
      set({ 
        error: error.response?.data?.message || 'Failed to fetch analytics',
        loading: false 
      })
    }
  },

  fetchClassAnalytics: async (classId) => {
    try {
      set({ loading: true, error: null })
      
      const response = await axiosInstance.get(`/analytics/class/${classId}`)
      
      set(state => ({
        classAnalytics: {
          ...state.classAnalytics,
          [classId]: response.data
        },
        loading: false
      }))
      
      return response.data
    } catch (error) {
      console.error('Error fetching class analytics:', error)
      set({ 
        error: error.response?.data?.message || 'Failed to fetch class analytics',
        loading: false 
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  
  reset: () => set({
    overallAnalytics: null,
    classAnalytics: {},
    recentQuizzes: [],
    monthlyTrends: [],
    loading: false,
    error: null
  })
}))

