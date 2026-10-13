import { create } from 'zustand'

const API_BASE_URL = 'http://localhost:5001/api'

export const useConsultationStore = create((set, get) => ({
  consultations: [],
  currentConsultation: null,
  loading: false,
  error: null,

  // Request consultation (student)
  requestConsultation: async (classId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ classId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request consultation')
      }

      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get student consultations
  getStudentConsultations: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/student`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch consultations')
      }

      set({ consultations: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get teacher consultations
  getTeacherConsultations: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/teacher`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch consultations')
      }

      set({ consultations: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Accept consultation (teacher)
  acceptConsultation: async (consultationId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/accept/${consultationId}`, {
        method: 'PUT',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept consultation')
      }

      // Update the consultation in the list
      const { consultations } = get()
      const updatedConsultations = consultations.map(consultation =>
        consultation._id === consultationId ? data.consultation : consultation
      )
      
      set({ consultations: updatedConsultations, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Send message
  sendMessage: async (consultationId, message) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      set({ currentConsultation: data.consultation, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get consultation details
  getConsultationDetails: async (consultationId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch consultation details')
      }

      set({ currentConsultation: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Complete consultation
  completeConsultation: async (consultationId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/complete`, {
        method: 'PUT',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete consultation')
      }

      // Update the consultation in the list
      const { consultations } = get()
      const updatedConsultations = consultations.map(consultation =>
        consultation._id === consultationId ? data.consultation : consultation
      )
      
      set({ consultations: updatedConsultations, currentConsultation: data.consultation, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Clear current consultation
  clearCurrentConsultation: () => {
    set({ currentConsultation: null })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
