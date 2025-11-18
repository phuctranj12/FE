import apiClient from './apiClient';

const DocumentTemplatesService = {
    getAllTypes({ page = 0, size = 10, textSearch = "", organizationId = "" } = {}) {
        const token = localStorage.getItem("jwt");
        return apiClient.get('/contracts/types', {
            params: { page, size, textSearch, organizationId },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Lấy template theo ID
    getTemplateById(templateId) {
        const token = localStorage.getItem("jwt");
        return apiClient.get(`/document-templates/${templateId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Tạo template
    createTemplate(templateData) {
        const token = localStorage.getItem("jwt");
        return apiClient.post('/document-templates', templateData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Cập nhật template
    updateTemplate(templateId, templateData) {
        const token = localStorage.getItem("jwt");
        return apiClient.put(`/document-templates/${templateId}`, templateData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    // Xoá template
    deleteTemplate(templateId) {
        const token = localStorage.getItem("jwt");
        return apiClient.delete(`/document-templates/${templateId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};

export default DocumentTemplatesService;
