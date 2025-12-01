import apiClient from './apiClient';

const OrganizationService = {
    // Lấy tất cả tổ chức có phân trang và tìm kiếm
    getAll({ page = 0, size = 10, textSearch = "" } = {}) {
        const token = localStorage.getItem("jwt");
        return apiClient.get('customers/organizations/get-all', {
            params: { page, size, textSearch },
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Xem chi tiết tổ chức theo ID
    getById(organizationId) {
        const token = localStorage.getItem("jwt");
        return apiClient.get(`customers/organizations/${organizationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Tạo mới tổ chức
    create(data) {
        const token = localStorage.getItem("jwt");
        return apiClient.post('customers/organizations/create', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Cập nhật tổ chức
    update(organizationId, data) {
        const token = localStorage.getItem("jwt");
        return apiClient.put(`customers/organizations/update/${organizationId}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Xóa tổ chức
    delete(organizationId) {
        const token = localStorage.getItem("jwt");
        return apiClient.delete(`customers/organizations/delete/${organizationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Internal API: Lấy thông tin tổ chức theo email khách hàng
    getByCustomerEmail(customerEmail) {
        const token = localStorage.getItem("jwt");
        return apiClient.get('customers/organizations/internal/get-by-email-customer', {
            params: { customerEmail },
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Internal API: Lấy thông tin tổ chức theo ID
    getByIdInternal(organizationId) {
        const token = localStorage.getItem("jwt");
        return apiClient.get('customers/organizations/internal/get-by-id', {
            params: { organizationId },
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

export default OrganizationService;
