import apiClient from './apiClient';

const contractService = {
    // ========== CONTRACT API ==========
    
    // 7.1.1. Kiểm tra mã hợp đồng unique
    checkCodeUnique: async (code) => {
        try {
            const response = await apiClient.get('/contracts/check-code-unique', {
                params: { code }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.2. Tạo hợp đồng mới
    createContract: async (contractData) => {
        try {
            const response = await apiClient.post('/contracts/create-contract', contractData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.3. Lấy thông tin hợp đồng theo ID
    getContractById: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.4. Thay đổi trạng thái hợp đồng
    changeContractStatus: async (contractId, status) => {
        try {
            const response = await apiClient.put(`/contracts/change-status/${contractId}`, null, {
                params: { status }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.5. Danh sách hợp đồng mình đã tạo
    getMyContracts: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                status: params.status || '',
                fromDate: params.fromDate || '',
                toDate: params.toDate || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/contracts/my-contracts', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.6. Danh sách hợp đồng mình tham gia xử lý
    getMyProcessContracts: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                status: params.status || '',
                fromDate: params.fromDate || '',
                toDate: params.toDate || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/contracts/my-process', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.7. Danh sách hợp đồng theo tổ chức
    getContractsByOrganization: async (organizationId, params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                status: params.status || '',
                fromDate: params.fromDate || '',
                toDate: params.toDate || '',
                organizationId: organizationId
            };
            const response = await apiClient.get('/contracts/contract-by-organization', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.8. Cập nhật hợp đồng
    updateContract: async (contractId, contractData) => {
        try {
            const response = await apiClient.put(`/contracts/update-contract/${contractId}`, contractData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.1.9. Lấy luồng BPMN của hợp đồng
    getBpmnFlow: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/bpmn-flow/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== DOCUMENT API ==========

    // 7.2.1. Lấy số lượng trang PDF
    getPageSize: async (file) => {
        try {
            console.log('[getPageSize] Starting API call...');
            console.log('[getPageSize] File info:', {
                name: file?.name,
                size: file?.size,
                type: file?.type,
                lastModified: file?.lastModified ? new Date(file.lastModified).toISOString() : 'N/A'
            });

            const formData = new FormData();
            formData.append('file', file);
            
            console.log('[getPageSize] Sending POST request to /contracts/documents/get-page-size');
            console.log('[getPageSize] FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
                key,
                value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
            })));

            const response = await apiClient.post('/contracts/documents/get-page-size', formData, {
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            console.log('[getPageSize] API Response received:', {
                code: response?.code,
                message: response?.message,
                data: response?.data
            });

            if (response?.data) {
                console.log('[getPageSize] Page size data:', {
                    fileName: response.data.fileName,
                    numberOfPages: response.data.numberOfPages
                });
            }

            return response;
        } catch (error) {
            console.error('[getPageSize] API Error:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                statusText: error?.response?.statusText
            });
            throw error;
        }
    },

    // 7.2.2. Kiểm tra chữ ký số trong tài liệu
    checkSignature: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/contracts/documents/check-signature', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.2.3. Tải lên tài liệu
    uploadDocument: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/contracts/documents/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.2.4. Tạo bản ghi tài liệu
    createDocument: async (documentData) => {
        try {
            const response = await apiClient.post('/contracts/documents/create-document', documentData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.2.5. Lấy URL truy cập tài liệu
    getPresignedUrl: async (docId) => {
        try {
            const response = await apiClient.get(`/contracts/documents/get-presigned-url/${docId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.2.6. Lấy tài liệu theo hợp đồng
    getDocumentsByContract: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/documents/get-document-by-contract/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== TYPE API ==========

    // 7.3.1. Tạo loại hợp đồng mới
    createType: async (typeData) => {
        try {
            const response = await apiClient.post('/contracts/types', typeData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.3.2. Cập nhật loại hợp đồng
    updateType: async (typeId, typeData) => {
        try {
            const response = await apiClient.put(`/contracts/types/${typeId}`, typeData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.3.3. Xóa loại hợp đồng
    deleteType: async (typeId) => {
        try {
            const response = await apiClient.delete(`/contracts/types/${typeId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.3.4. Lấy loại hợp đồng theo ID
    getTypeById: async (typeId) => {
        try {
            const response = await apiClient.get(`/contracts/types/${typeId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.3.5. Lấy tất cả loại hợp đồng
    getAllTypes: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/contracts/types', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== PARTICIPANT API ==========

    // 7.4.1. Tạo tổ chức tham gia hợp đồng
    createParticipant: async (contractId, participants) => {
        try {
            const response = await apiClient.post(`/contracts/participants/create-participant/${contractId}`, participants);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.4.2. Lấy thông tin tổ chức tham gia theo ID
    getParticipantById: async (participantId) => {
        try {
            const response = await apiClient.get(`/contracts/participants/${participantId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.4.3. Lấy danh sách tổ chức tham gia theo hợp đồng
    getParticipantsByContract: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/participants/by-contract/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== FIELD API ==========

    // 7.5.1. Thêm trường dữ liệu cho hợp đồng
    createField: async (fields) => {
        try {
            const response = await apiClient.post('/contracts/fields/create', fields);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== RECIPIENT API ==========

    // 7.6.1. Lấy thông tin người xử lý theo ID
    getRecipientById: async (recipientId) => {
        try {
            const response = await apiClient.get(`/contracts/recipients/${recipientId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== SHARE API ==========

    // 7.7.1. Tạo chia sẻ hợp đồng
    createShare: async (shareData) => {
        try {
            const response = await apiClient.post('/contracts/shares', shareData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.7.2. Lấy danh sách chia sẻ hợp đồng
    getAllShares: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                status: params.status || '',
                fromDate: params.fromDate || '',
                toDate: params.toDate || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/contracts/shares', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== CONTRACT REF API ==========

    // 7.8.1. Lấy tất cả tham chiếu hợp đồng
    getAllContractRefs: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || '',
                organizationId: params.organizationId || ''
            };
            const response = await apiClient.get('/contracts/contract-refs/all-refs', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== CERTIFICATE API ==========

    // 7.9.1. Import chứng thư số
    importCert: async (file, password, status, listEmail = []) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);
            formData.append('status', status);
            if (listEmail && listEmail.length > 0) {
                listEmail.forEach(email => {
                    formData.append('list_email', email);
                });
            }
            const response = await apiClient.post('/contracts/certs/import-cert', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.2. Lấy chứng thư số theo user
    getCertByUser: async () => {
        try {
            const response = await apiClient.get('/contracts/certs/find-cert-user');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.3. Cập nhật thông tin user từ chứng thư số
    updateUserFromCert: async (certificateId, status, listEmail = []) => {
        try {
            const queryParams = {
                certificateId: certificateId,
                status: status
            };
            // Axios will serialize array params as repeated query params
            if (listEmail && listEmail.length > 0) {
                queryParams.list_email = listEmail;
            }
            const response = await apiClient.post('/contracts/certs/update-user-from-cert', null, {
                params: queryParams
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.4. Xóa user khỏi chứng thư số
    removeUserFromCert: async (certificateId, customerIds) => {
        try {
            const queryParams = {
                certificateId: certificateId
            };
            // Axios will serialize array params as repeated query params
            if (customerIds && customerIds.length > 0) {
                queryParams.customerIds = customerIds;
            }
            const response = await apiClient.delete('/contracts/certs/remove-user-from-cert', {
                params: queryParams
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.5. Lấy thông tin chứng thư số
    getCertInformation: async (certificateId) => {
        try {
            const response = await apiClient.get('/contracts/certs/cert-information', {
                params: { certificateId }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.6. Lấy chứng thư số theo ID
    getCertById: async (certificateId) => {
        try {
            const response = await apiClient.get('/contracts/certs/find-cert-by-id', {
                params: { certificateId }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 7.9.7. Tìm kiếm chứng thư số
    searchCert: async (params = {}) => {
        try {
            const queryParams = {
                subject: params.subject || '',
                serial_number: params.serial_number || '',
                status: params.status || 1,
                page: params.page || 0,
                size: params.size || 10
            };
            const response = await apiClient.get('/contracts/certs/find-cert', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default contractService;
