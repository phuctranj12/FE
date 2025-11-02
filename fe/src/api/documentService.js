
import { mockDocuments } from "../data/mockDocuments";
export const getDocuments = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockDocuments), 500);
    });
};

// import apiClient from './apiClient';

// const documentService = {


//     // 1.1. Lấy danh sách tài liệu
//     getAllDocuments: async (params = {}) => {
//         try {
//             const queryParams = {
//                 page: params.page || 0,
//                 size: params.size || 10,
//                 textSearch: params.textSearch || '',
//                 status: params.status || '',
//                 type: params.type || '',
//                 contractId: params.contractId || ''
//             };
//             const response = await apiClient.get('/documents/get-all', { params: queryParams });
//             return response;
//         } catch (error) {
//             throw error;
//         }
//     },

//     // 1.2. Lấy chi tiết tài liệu theo ID
//     getDocumentById: async (documentId) => {
//         try {
//             const response = await apiClient.get(`/documents/${documentId}`);
//             return response;
//         } catch (error) {
//             throw error;
//         }
//     },

//     // 1.3. Tạo mới tài liệu
//     createDocument: async (documentData) => {
//         try {
//             const response = await apiClient.post('/documents/create', documentData);
//             return response;
//         } catch (error) {
//             throw error;
//         }
//     },

//     // 1.4. Cập nhật tài liệu
//     updateDocument: async (documentId, documentData) => {
//         try {
//             const response = await apiClient.put(`/documents/update/${documentId}`, documentData);
//             return response;
//         } catch (error) {
//             throw error;
//         }
//     },

//     // 1.5. Xóa tài liệu
//     deleteDocument: async (documentId) => {
//         try {
//             const response = await apiClient.delete(`/documents/delete/${documentId}`);
//             return response;
//         } catch (error) {
//             throw error;
//         }
//     }
// };

// export default documentService;
