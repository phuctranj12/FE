// 📁 src/services/certificateService.js
import apiClient from './apiClient';

const certificateService = {

    // 1️⃣ Lấy danh sách chứng thư số của user đăng nhập
    getAllCertificates: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('/contracts/find-cert-user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách chứng thư số của user:', error);
            throw error.response?.data || error;
        }
    },

    // 2️⃣ Lấy chứng thư số theo ID
    getCertificateById: async (certificateId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/certificates/${certificateId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy chứng thư số theo ID:', error);
            throw error.response?.data || error;
        }
    },

    // 3️⃣ Tạo mới chứng thư số
    createCertificate: async (certificateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.post('/certificates/create', certificateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tạo chứng thư số:', error);
            throw error.response?.data || error;
        }
    },

    // 4️⃣ Cập nhật chứng thư số
    updateCertificate: async (certificateId, certificateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.put(`/certificates/update/${certificateId}`, certificateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật chứng thư số:', error);
            throw error.response?.data || error;
        }
    },

    // 5️⃣ Xóa chứng thư số
    deleteCertificate: async (certificateId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.delete(`/certificates/delete/${certificateId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi xóa chứng thư số:', error);
            throw error.response?.data || error;
        }
    },
};

export default certificateService;
