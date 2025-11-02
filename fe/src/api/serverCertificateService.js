// src/services/certificateService.js
import apiClient from './apiClient';
import { mockServerCertificates } from '../data/mockServerCertificates';

const certificateService = {

    getAllCertificates: async (params = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockServerCertificates), 500);
        });
        // try {
        //     const queryParams = {
        //         page: params.page || 0,
        //         size: params.size || 10,
        //         textSearch: params.textSearch || '',
        //         status: params.status || ''
        //     };

        //     const response = await apiClient.get('/certificates/get-all', { params: queryParams });
        //     return response;
        // } catch (error) {
        //     throw error;
        // }
    },

    // 2. Lấy chứng thư số theo ID
    getCertificateById: async (certificateId) => {
        try {
            const response = await apiClient.get(`/certificates/${certificateId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 3. Tạo mới chứng thư số
    createCertificate: async (certificateData) => {
        try {
            const response = await apiClient.post('/certificates/create', certificateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 4. Cập nhật chứng thư số
    updateCertificate: async (certificateId, certificateData) => {
        try {
            const response = await apiClient.put(`/certificates/update/${certificateId}`, certificateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 5. Xóa chứng thư số
    deleteCertificate: async (certificateId) => {
        try {
            const response = await apiClient.delete(`/certificates/delete/${certificateId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default certificateService;
