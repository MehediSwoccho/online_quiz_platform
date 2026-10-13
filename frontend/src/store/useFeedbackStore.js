import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useFeedbackStore = create((set) => ({
  feedback: [],
  loading: false,
  error: null,

  // Create teacher feedback
  createTeacherFeedback: async (classId, content) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.post('/feedback/teacher', {
        classId,
        content
      });
      
      // Add the new feedback to the list
      set(state => ({
        feedback: [response.data, ...state.feedback],
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error creating teacher feedback:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to create feedback'
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create feedback'
      };
    }
  },

  // Create student comment
  createStudentComment: async (classId, content) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.post('/feedback/student', {
        classId,
        content
      });
      
      // Add the new comment to the list
      set(state => ({
        feedback: [response.data, ...state.feedback],
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error creating student comment:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to create comment'
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create comment'
      };
    }
  },

  // Get all feedback for a class
  getClassFeedback: async (classId) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/feedback/class/${classId}`);
      set({ feedback: response.data, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error fetching class feedback:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch feedback'
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch feedback'
      };
    }
  },

  // Clear feedback state
  clearFeedback: () => {
    set({ feedback: [], loading: false, error: null });
  }
}));