import apiClient from './apiClient';

const certificateService = {

    // 1️⃣ Lấy chứng thư số theo user đăng nhập
    getAllCertificates: async () => {
        try {
            const response = await apiClient.get('/contracts/find-cert-user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // lấy token từ localStorage
                    'Accept': '*/*'
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy chứng thư số theo user:', error);
            throw error;
        }
    },

    // 2️⃣ Lấy chứng thư số theo ID
    getCertificateById: async (certificateId) => {
        try {
            const response = await apiClient.get(`/certificates/${certificateId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3️⃣ Tạo mới chứng thư số
    createCertificate: async (certificateData) => {
        try {
            const response = await apiClient.post('/certificates/create', certificateData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4️⃣ Cập nhật chứng thư số
    updateCertificate: async (certificateId, certificateData) => {
        try {
            const response = await apiClient.put(`/certificates/update/${certificateId}`, certificateData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 5️⃣ Xóa chứng thư số
    deleteCertificate: async (certificateId) => {
        try {
            const response = await apiClient.delete(`/certificates/delete/${certificateId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default certificateService;
