import apiClient from './apiClient';

const notificationService = {
    // Get all notifications with pagination
    getAllNotice: async (page = 0, size = 10) => {
        try {
            const response = await apiClient.get('notifications/get-all-notice', {
                params: { page, size }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Mark notification as read
    readNotice: async (id) => {
        try {
            const response = await apiClient.put(`notifications/read-notice/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Send email notification (internal use)
    sendEmailNotification: async (emailData) => {
        try {
            const response = await apiClient.post('notifications/internal/send-email', emailData);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default notificationService;