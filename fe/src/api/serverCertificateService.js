// 📁 src/services/certificateService.js
import apiClient from './apiClient';
import qs from 'qs';

const certificateService = {

    // 1️⃣ Lấy danh sách chứng thư số của user đăng nhập
    getAllCertificates: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('/contracts/certs/find-cert-user', {
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

    // 6️⃣ Tìm kiếm + phân trang server-side -> /find-cert
    findCerts: async ({ subject = "", serial_number = "", status = 1, size = 10, page = 0 }) => {
        try {
            const params = { subject, serial_number, status, size, page };
            const res = await apiClient.get("/certs/find-cert", { params });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm chứng thư số:', error);
            throw error.response?.data || error;
        }
    },

    // 7️⃣ Import file .p12
    // 7️⃣ Import file .p12 - FIXED VERSION
    importCert: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            console.log('🚀 Importing cert with formData:', formData);

            // Debug: In ra nội dung FormData
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await apiClient.post("/contracts/certs/import-cert", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi import chứng thư số:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error.response?.data || error;
        }
    },


    // 8️⃣ Update user from cert
    updateUserFromCert: async ({ certificateId, status, emails = [] }) => {
        try {
            const form = new FormData();
            form.append("certificateId", certificateId);
            form.append("status", status);
            emails.forEach((e) => form.append("list_email", e));

            const token = localStorage.getItem('token');
            const res = await apiClient.post("/certs/update-user-from-cert", form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật user từ cert:', error);
            throw error.response?.data || error;
        }
    },

    // 9️⃣ Remove user from cert
    removeUserFromCert: async ({ certificateId, customerIds = [] }) => {
        try {
            const params = { certificateId, customerIds };
            const token = localStorage.getItem('token');
            const res = await apiClient.delete("/certs/remove-user-from-cert", {
                headers: { Authorization: `Bearer ${token}` },
                params,
                paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi xóa user khỏi cert:', error);
            throw error.response?.data || error;
        }
    },

    // 🔟 Get cert info by id
    certInformation: async (certificateId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await apiClient.get("/certs/cert-information", {
                headers: { Authorization: `Bearer ${token}` },
                params: { certificateId }
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin cert:', error);
            throw error.response?.data || error;
        }
    },

    // 1️⃣1️⃣ Find cert by id
    findCertById: async (certificateId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await apiClient.get("/certs/find-cert-by-id", {
                headers: { Authorization: `Bearer ${token}` },
                params: { certificateId }
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('❌ Lỗi khi tìm cert theo ID:', error);
            throw error.response?.data || error;
        }
    }
};

export default certificateService;
