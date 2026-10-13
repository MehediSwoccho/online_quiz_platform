import axios from "axios"

// Create axios instance with configuration
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials:true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 15000 // 15 second timeout
})

// Add request interceptor for request handling without logging request contents.
axiosInstance.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Don't retry if we've already retried or it's a 401/403 error
        if (!originalRequest || originalRequest._retry || 
            (error.response && (error.response.status === 401 || error.response.status === 403))) {
            return Promise.reject(error);
        }
        
        // If the error is a network error or a timeout, retry once
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
            originalRequest._retry = true;
            return new Promise(resolve => setTimeout(() => resolve(axiosInstance(originalRequest)), 2000));
        }
        
        return Promise.reject(error);
    }
)