import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useParentStore = create((set, get) => ({
  quizResults: [],
  notifications: [],
  loading: false,
  error: null,
  studentInfo: null,

  // Get all quiz results for the child
  getQuizResults: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching quiz results from /parent/quiz-results');
      const response = await axiosInstance.get('/parent/quiz-results');
      console.log('Quiz results response:', response.data);
      set({ 
        quizResults: response.data.results || [],
        studentInfo: {
          name: response.data.studentName,
          email: response.data.studentEmail
        },
        loading: false 
      });
      return { success: true };
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      console.error('Error response:', error.response?.data);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch quiz results',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get detailed quiz result
  getQuizResultDetails: async (submissionId) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/parent/quiz-results/${submissionId}`);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching quiz result details:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch quiz details',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Get parent notifications (low scores)
  getNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get('/parent/notifications');
      set({ 
        notifications: response.data.notifications,
        loading: false 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    quizResults: [],
    notifications: [],
    loading: false,
    error: null,
    studentInfo: null
  })
}));
