import apiClient from './apiClient';

const notificationService = {
    // Get all notifications (with pagination and search)
    getNotifications: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || ''
            };
            const response = await apiClient.get('/notifications/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get unread notifications count
    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/notifications/unread-count');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (id) => {
        try {
            const response = await apiClient.put(`/notifications/${id}/read`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await apiClient.put('/notifications/read-all');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            const response = await apiClient.delete(`/notifications/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete all notifications
    deleteAllNotifications: async () => {
        try {
            const response = await apiClient.delete('/notifications');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Create notification
    createNotification: async (notificationData) => {
        try {
            const response = await apiClient.post('/notifications', notificationData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update notification settings
    updateSettings: async (settings) => {
        try {
            const response = await apiClient.put('/notifications/settings', settings);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get notification settings
    getSettings: async () => {
        try {
            const response = await apiClient.get('/notifications/settings');
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default notificationService;

