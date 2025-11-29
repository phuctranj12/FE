import apiClient from './apiClient';

const documentService = {
    // ==================== DANH SÁCH HỢP ĐỒNG ====================

    // Danh sách tài liệu đã tạo
    getMyContracts: async (filterContractDTO = {}) => {
        try {
            const body = {
                ...(typeof filterContractDTO.status === 'number' ? { status: filterContractDTO.status } : {}),
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
            };
            const response = await apiClient.post('/contracts/my-contracts', body);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Danh sách tài liệu nhận
    getReceivedContracts: async (filterContractDTO = {}) => {
        try {
            const body = {
                ...(typeof filterContractDTO.status === 'number' ? { status: filterContractDTO.status } : {}),
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
            };
            const response = await apiClient.post('/contracts/received-contracts', body);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Danh sách tài liệu của tổ chức
    getOrganizationContracts: async (filterContractDTO = {}) => {
        try {
            const body = {
                ...(typeof filterContractDTO.status === 'number' ? { status: filterContractDTO.status } : {}),
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10,
                organizationId: filterContractDTO.organizationId || 1 // mặc định id = 1
            };
            const response = await apiClient.post('/contracts/contract-by-organization', body);
            return response;
        } catch (error) {
            throw error;
        }
    },


    // Danh sách hợp đồng chia sẻ
    getSharedContracts: async (params = {}) => {
        try {
            // const queryParams = {
            //     textSearch: params.textSearch || "",
            //     fromDate: params.fromDate || null,
            //     toDate: params.toDate || null,
            //     page: params.page ?? 0,
            //     size: params.size ?? 10
            // };
            // const response = await apiClient.get('/contracts/shared', { params: queryParams });
            const response = await apiClient.get('/contracts/shared');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== CHI TIẾT HỢP ĐỒNG ====================

    // Lấy chi tiết hợp đồng theo ID
    getContractById: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Xem luồng ký
    getSignFlow: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/bpmn-flow/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== TẠO VÀ CẬP NHẬT HỢP ĐỒNG ====================

    // Tạo hợp đồng mới
    createContract: async (contractData) => {
        try {
            const body = {
                name: contractData.name,
                contractNo: contractData.contractNo,
                signTime: contractData.signTime,
                note: contractData.note || "",
                contractRefs: contractData.contractRefs || [],
                typeId: contractData.typeId,
                isTemplate: contractData.isTemplate ?? false,
                templateContractId: contractData.templateContractId || null,
                contractExpireTime: contractData.contractExpireTime
            };
            const response = await apiClient.post('/contracts', body);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật hợp đồng
    updateContract: async (contractId, data) => {
        try {
            const response = await apiClient.put(
                `/contracts/update-contract/${contractId}`,
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Thay đổi trạng thái hợp đồng
    changeContractStatus: async (contractId, newStatus, reason = "") => {
        try {
            const body = { reason };
            const response = await apiClient.put(
                `/contracts/${contractId}/change-status/${newStatus}`,
                body
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Hủy hợp đồng (status = 32)
    cancelContract: async (contractId, reason = 'Hủy hợp đồng') => {
        try {
            return await documentService.changeContractStatus(contractId, 32, reason);
        } catch (error) {
            throw error;
        }
    },

    // Xóa hợp đồng (thực chất là hủy)
    deleteContract: async (contractId, reason = 'Xóa tài liệu') => {
        try {
            return await documentService.changeContractStatus(contractId, 32, reason);
        } catch (error) {
            throw error;
        }
    },

    // ==================== CHIA SẺ HỢP ĐỒNG ====================

    // Chia sẻ hợp đồng
    shareContract: async (contractId, emails = []) => {
        try {
            const body = {
                email: emails,
                contractId: contractId
            };
            const response = await apiClient.post('/contracts/shares', body);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== PARTICIPANTS & RECIPIENTS ====================

    // Lưu thông tin người xử lý
    saveParticipants: async (participants = []) => {
        try {
            const response = await apiClient.post('/participants', participants);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== DOCUMENTS ====================

    // Upload file lên Minio
    uploadFileToMinio: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lưu thông tin document vào DB
    saveDocument: async (documentData) => {
        try {
            const body = {
                name: documentData.name,
                type: documentData.type,
                contractId: documentData.contractId,
                fileName: documentData.fileName,
                path: documentData.path,
                status: documentData.status ?? 1
            };
            const response = await apiClient.post('/documents', body);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy URL file từ Minio
    getFileUrl: async (docId) => {
        try {
            const response = await apiClient.get(`/documents/${docId}/url`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Kiểm tra số lượng trang
    checkPageCount: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/documents/check-pages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Kiểm tra chữ ký số
    checkDigitalSignature: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/documents/check-signature', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== FIELDS ====================

    // Tạo fields
    createFields: async (fields = []) => {
        try {
            const response = await apiClient.post('/fields', fields);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== VALIDATION ====================

    // Kiểm tra mã contract_no
    checkContractNo: async (code) => {
        try {
            const response = await apiClient.get('/contracts/check-contract-no', {
                params: { code }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== TÌM KIẾM VÀ GỢI Ý ====================

    // Gợi ý tên (autocomplete)
    searchSuggestions: async (keyword) => {
        try {
            const response = await apiClient.get('/users/search', {
                params: { keyword }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== THÔNG TIN NGƯỜI DÙNG & TỔ CHỨC ====================

    // Lấy thông tin người dùng hiện tại
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/users/me');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết tổ chức
    getOrganizationDetail: async (orgId) => {
        try {
            const response = await apiClient.get(`/organizations/${orgId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== LOẠI TÀI LIỆU ====================

    // Lấy danh sách loại tài liệu
    getDocumentTypes: async () => {
        try {
            const response = await apiClient.get('/document-types');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ==================== HỢP ĐỒNG LIÊN QUAN ====================

    // Lấy tất cả hợp đồng liên quan theo tổ chức
    getRelatedContracts: async (organizationId) => {
        try {
            const response = await apiClient.get('/contracts/related', {
                params: { organizationId }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Kiểm tra chữ ký số trong tài liệu (verify signature)
    verifySignature: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/contracts/documents/verify-signature', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default documentService;