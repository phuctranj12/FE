// 📁 src/services/reportService.js
import apiClient from './apiClient';

const reportService = {

    // 1️⃣ Lấy chi tiết báo cáo
    getReportDetail: async (organizationId, params) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/contracts/reports/detail/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: {
                    fromDate: params.fromDate,
                    toDate: params.toDate,
                    completed_from_date: params.completedFromDate,
                    completed_to_date: params.completedToDate,
                    status: params.status,
                    textSearch: params.textSearch,
                    page: params.page || 0,
                    size: params.size || 10,
                }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy chi tiết báo cáo:', error);
            throw error.response?.data || error;
        }
    },

    // 2️⃣ Lấy báo cáo theo trạng thái
    getReportByStatus: async (organizationId, params) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/contracts/reports/by-status/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: {
                    fromDate: params.fromDate,
                    toDate: params.toDate,
                    completed_from_date: params.completedFromDate,
                    completed_to_date: params.completedToDate,
                    status: params.status,
                    textSearch: params.textSearch,
                    page: params.page || 0,
                    size: params.size || 10,
                }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy báo cáo theo trạng thái:', error);
            throw error.response?.data || error;
        }
    },

    // 3️⃣ Lấy báo cáo hợp đồng nhận (My Process)
    getReportMyProcess: async (organizationId, params) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/contracts/reports/my-process/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: {
                    fromDate: params.fromDate,
                    toDate: params.toDate,
                    completed_from_date: params.completedFromDate,
                    completed_to_date: params.completedToDate,
                    status: params.status,
                    textSearch: params.textSearch,
                    page: params.page || 0,
                    size: params.size || 10,
                }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy báo cáo hợp đồng nhận:', error);
            throw error.response?.data || error;
        }
    },

    // 4️⃣ Lấy số lượng hợp đồng theo trạng thái
    getReportNumberByStatus: async (organizationId, fromDate, toDate) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/contracts/reports/number-by-status/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: {
                    fromDate,
                    toDate
                }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy số lượng hợp đồng theo trạng thái:', error);
            throw error.response?.data || error;
        }
    },

    // 5️⃣ Lấy số lượng hợp đồng theo loại tài liệu
    getReportNumberByType: async (organizationId, fromDate, toDate) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/contracts/reports/number-by-type/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: {
                    fromDate,
                    toDate
                }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy số lượng hợp đồng theo loại tài liệu:', error);
            throw error.response?.data || error;
        }
    },

};

export default reportService;