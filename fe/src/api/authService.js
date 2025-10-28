import apiClient from './apiClient';

const authService = {
    // ========== AUTH API ==========
    
    // 1.1. Login
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            // API returns { code, message, data: { access_token } }
            if (response.data && response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 1.2. Register
    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 1.3. Logout
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } catch (error) {
            // Clear local storage even if API call fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    },

    // ========== PASSWORD & EMAIL API ==========
    
    // Forgot password (if available)
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/auth/forgot-password', { email });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Reset password (if available)
    resetPassword: async (token, password) => {
        try {
            const response = await apiClient.post('/auth/reset-password', { token, password });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Verify email (if available)
    verifyEmail: async (token) => {
        try {
            const response = await apiClient.post('/auth/verify-email', { token });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Refresh token (if available)
    refreshToken: async () => {
        try {
            const response = await apiClient.post('/auth/refresh');
            if (response.data && response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default authService;
