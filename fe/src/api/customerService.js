import apiClient from './apiClient';

const customerService = {
    // ========== CUSTOMER API ==========
    
    // 2.1. Tạo mới user
    createCustomer: async (customerData) => {
        try {
            const response = await apiClient.post('/customers/customers/create-customer', customerData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.2. Cập nhật thông tin user
    updateCustomer: async (customerId, customerData) => {
        try {
            const response = await apiClient.put(`/customers/update-customer/${customerId}`, customerData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.3. Xóa user
    deleteCustomer: async (customerId) => {
        try {
            const response = await apiClient.delete(`/customers/delete-customer/${customerId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.4. Xem chi tiết user
    getCustomerById: async (customerId) => {
        try {
            const response = await apiClient.get(`/customers/${customerId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.5. Danh sách user (với phân trang và tìm kiếm)
    getAllCustomers: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/customers/get-all-customer', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.6. Lấy thông tin user theo email
    getCustomerByEmail: async (email) => {
        try {
            const response = await apiClient.get('/customers/get-by-email', { 
                params: { email } 
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 2.8. Đổi mật khẩu
    changePassword: async (customerId, passwordData) => {
        try {
            const response = await apiClient.put(`/customers/change-password/${customerId}`, passwordData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== ROLE API ==========

    // 3.1. Tạo mới vai trò
    createRole: async (roleData) => {
        try {
            const response = await apiClient.post('/customers/roles/create', roleData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 3.2. Cập nhật vai trò
    updateRole: async (roleId, roleData) => {
        try {
            const response = await apiClient.put(`/customers/roles/update/${roleId}`, roleData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 3.3. Xóa vai trò
    deleteRole: async (roleId) => {
        try {
            const response = await apiClient.delete(`/customers/roles/delete/${roleId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 3.4. Danh sách vai trò
    getAllRoles: async (params = {}) => {
        try {
            const queryParams = {
                textSearch: params.textSearch || '',
                page: params.page || 0,
                size: params.size || 10
            };
            const response = await apiClient.get('/customers/roles/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 3.5. Thông tin chi tiết vai trò
    getRoleById: async (roleId) => {
        try {
            const response = await apiClient.get(`/customers/roles/${roleId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== ORGANIZATION API ==========

    // 4.1. Tạo mới tổ chức
    createOrganization: async (organizationData) => {
        try {
            const response = await apiClient.post('/customers/organizations/create', organizationData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 4.2. Xóa tổ chức
    deleteOrganization: async (organizationId) => {
        try {
            const response = await apiClient.delete(`/customers/organizations/delete/${organizationId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 4.3. Cập nhật tổ chức
    updateOrganization: async (organizationId, organizationData) => {
        try {
            const response = await apiClient.put(`/customers/organizations/update/${organizationId}`, organizationData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 4.4. Lấy danh sách tất cả tổ chức
    getAllOrganizations: async (params = {}) => {
        try {
            const queryParams = {
                textSearch: params.textSearch || '',
                page: params.page || 0,
                size: params.size || 10
            };
            const response = await apiClient.get('/customers/organizations/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 4.5. Xem chi tiết tổ chức
    getOrganizationById: async (organizationId) => {
        try {
            const response = await apiClient.get(`/customers/organizations/${organizationId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 👉= PERMISSION API ==========

    // 5.1. Danh sách phân quyền
    getAllPermissions: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || ''
            };
            const response = await apiClient.get('/customers/permissions/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default customerService;
