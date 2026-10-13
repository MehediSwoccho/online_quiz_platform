import {create} from "zustand"
import { axiosInstance } from "../lib/axios"

export const authStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,

    login: async (email, password) => {
        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password
            });
            set({ authUser: res.data });
            return { success: true };
        } catch (error) {
            console.error("Error in login:", error);
            return {
                success: false,
                error: error.response?.data?.message || "An error occurred during login"
            };
        }
    },

    signup: async (userData) => {
        try {
            console.log('Attempting signup with data:', { ...userData, password: '***' });
            const res = await axiosInstance.post("/auth/signup", userData);
            console.log('Signup successful, response:', res.data);
            set({ authUser: res.data });
            return { success: true };
        } catch (error) {
            console.error("Error in signup:", error);
            let errorMessage = "An error occurred during signup";
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log('Response status:', error.response.status);
                console.log('Response headers:', error.response.headers);
                console.log('Response data:', error.response.data);
                
                errorMessage = error.response.data?.message || 
                              (error.response.data?.errors ? 'Validation error' : errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('Request error - no response received');
                console.log('Request details:', error.request);
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error message:', error.message);
                errorMessage = `Request setup error: ${error.message}`;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            return { success: true };
        } catch (error) {
            console.error("Error in logout:", error);
            return { 
                success: false,
                error: error.response?.data?.message || "An error occurred during logout"
            };
        }
    },

    checkAuth: async () => {
        try {
            console.log('checkAuth: Making request to /auth/check')
            const res = await axiosInstance.get("/auth/check");
            console.log('checkAuth: Response received:', res.data)
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in check auth:", error);
            
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', error.response.data);
            } else if (error.request) {
                console.log('Request error - no response received');
            } else {
                console.log('Error message:', error.message);
            }
            
            set({ authUser: null });
        } finally {
            console.log('checkAuth: Setting isCheckingAuth to false')
            set({ isCheckingAuth: false });
        }
    },

    updateProfile: async (profileData) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", profileData);
            set({ authUser: res.data });
            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            return {
                success: false,
                error: error.response?.data?.message || "An error occurred updating profile"
            };
        }
    },

    parentLogin: async (studentEmail) => {
        try {
            const res = await axiosInstance.post("/auth/parent-login", {
                studentEmail
            });
            set({ authUser: res.data });
            return { success: true };
        } catch (error) {
            console.error("Error in parent login:", error);
            return {
                success: false,
                error: error.response?.data?.message || "An error occurred during parent login"
            };
        }
    },

}))