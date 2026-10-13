import { create } from 'zustand'

const API_BASE_URL = 'http://localhost:5001/api'

export const useRatingStore = create((set, get) => ({
  loading: false,
  error: null,

  // Submit or update rating (student)
  submitRating: async (classId, rating) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ classId, rating })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit rating')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get student's rating for a class
  getStudentRating: async (classId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/student/${classId}`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rating')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get rating statistics for a class (teacher)
  getClassRatingStats: async (classId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/class/${classId}/stats`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rating statistics')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get all ratings for teacher
  getTeacherRatings: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/teacher`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch teacher ratings')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Delete rating (student)
  deleteRating: async (classId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/student/${classId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete rating')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
