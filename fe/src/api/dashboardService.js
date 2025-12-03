// 📁 src/services/dashboardService.js
import apiClient from './apiClient';

const dashboardService = {
    // 1️⃣ Lấy thông tin dashboard tài liệu nhận
    getReceivedDocuments: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('contracts/dashboard/my-process', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            console.log('🚀 Dữ liệu tài liệu nhận:', response);
            return response;
        } catch (error) {
            console.error('❌ Lỗi khi lấy dashboard tài liệu nhận:', error);
            throw error.response?.data || error;
        }
    },

    // 2️⃣ Lấy thông tin dashboard hợp đồng của tôi tạo
    getMyContracts: async ({ fromDate = null, toDate = null }) => {
        try {
            const token = localStorage.getItem('token');
            const params = {};

            // Chỉ thêm param nếu có giá trị (không truyền thì null)
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await apiClient.get('contracts/dashboard/my-contract', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params,
            });
            console.log('🚀 Dữ liệu hợp đồng của tôi:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy dashboard hợp đồng của tôi:', error);
            throw error.response?.data || error;
        }
    },

    // 3️⃣ Đếm số hợp đồng theo đơn vị/tổ chức
    getContractsByOrganization: async ({ fromDate = null, toDate = null, organizationId = null }) => {
        try {
            const token = localStorage.getItem('token');
            const params = {};

            // Chỉ thêm param nếu có giá trị (không truyền thì null)
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;
            if (organizationId) params.organizationId = organizationId;

            const response = await apiClient.get('/dashboard/count-contract-by-organization', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params,
            });
            console.log('Dữ liệu hợp đồng theo tổ chức:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy dashboard hợp đồng theo tổ chức:', error);
            throw error.response?.data || error;
        }
    },

    // 4️⃣ Lấy thông tin tài liệu đang xử lý
    // (Theo tài liệu: "Chính là api màn tài liệu tài liệu nhận đang xử lý")
    getProcessingDocuments: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('/dashboard/received-contract', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            console.log('🚀 Dữ liệu tài liệu đang xử lý:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy tài liệu đang xử lý:', error);
            throw error.response?.data || error;
        }
    },

    getCustomerUserMaxContracts: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('contracts/dashboard/statistics/customer-user-max-contracts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            console.log('🚀 Top user nhiều hợp đồng nhất:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy top user nhiều hợp đồng nhất:', error);
            throw error.response?.data || error;
        }
    },
};

export default dashboardService;