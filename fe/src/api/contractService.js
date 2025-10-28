import apiClient from './apiClient';

const contractService = {
    // ========== CONTRACT API ==========
    
    // Get all contracts (with pagination and search)
    getAllContracts: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || ''
            };
            const response = await apiClient.get('/contracts/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get contract by ID
    getContractById: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Create new contract
    createContract: async (contractData) => {
        try {
            const response = await apiClient.post('/contracts/create', contractData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update contract
    updateContract: async (contractId, contractData) => {
        try {
            const response = await apiClient.put(`/contracts/update/${contractId}`, contractData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete contract
    deleteContract: async (contractId) => {
        try {
            const response = await apiClient.delete(`/contracts/delete/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Sign contract
    signContract: async (contractId, signatureData) => {
        try {
            const response = await apiClient.post(`/contracts/${contractId}/sign`, signatureData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Send contract for signing
    sendForSigning: async (contractId, recipients) => {
        try {
            const response = await apiClient.post(`/contracts/${contractId}/send`, { recipients });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get contracts by status
    getContractsByStatus: async (status, params = {}) => {
        try {
            const queryParams = {
                ...params,
                status
            };
            const response = await apiClient.get('/contracts/get-by-status', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Download contract PDF
    downloadContract: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}/download`, {
                responseType: 'blob',
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Upload document
    uploadDocument: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/contracts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get contract workflow/history
    getContractWorkflow: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}/workflow`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Approve contract
    approveContract: async (contractId, approvalData) => {
        try {
            const response = await apiClient.post(`/contracts/${contractId}/approve`, approvalData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Reject contract
    rejectContract: async (contractId, rejectionData) => {
        try {
            const response = await apiClient.post(`/contracts/${contractId}/reject`, rejectionData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ========== TEMPLATE API ==========

    // Get all templates
    getAllTemplates: async (params = {}) => {
        try {
            const queryParams = {
                page: params.page || 0,
                size: params.size || 10,
                textSearch: params.textSearch || ''
            };
            const response = await apiClient.get('/contracts/templates/get-all', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get template by ID
    getTemplateById: async (templateId) => {
        try {
            const response = await apiClient.get(`/contracts/templates/${templateId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Create template
    createTemplate: async (templateData) => {
        try {
            const response = await apiClient.post('/contracts/templates/create', templateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update template
    updateTemplate: async (templateId, templateData) => {
        try {
            const response = await apiClient.put(`/contracts/templates/update/${templateId}`, templateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete template
    deleteTemplate: async (templateId) => {
        try {
            const response = await apiClient.delete(`/contracts/templates/delete/${templateId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Clone template
    cloneTemplate: async (templateId) => {
        try {
            const response = await apiClient.post(`/contracts/templates/${templateId}/clone`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Publish/Unpublish template
    publishTemplate: async (templateId, publish = true) => {
        try {
            const response = await apiClient.put(`/contracts/templates/${templateId}/publish`, { publish });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Share template
    shareTemplate: async (templateId, shareData) => {
        try {
            const response = await apiClient.post(`/contracts/templates/${templateId}/share`, shareData);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default contractService;
