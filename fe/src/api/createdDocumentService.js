import apiClient from './apiClient';

const createdDocumentService = {
    getCreatedContracts: async (filterContractDTO = {}) => {
        try {
            // Chuẩn hóa dữ liệu trước khi gửi
            const body = {
                status: filterContractDTO.status ?? 0,
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
                // organizationId bỏ 
            };

            // Gọi API tương ứng với hợp đồng do mình tạo
            const response = await apiClient.post('/contracts/my-process', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    },

    // API lấy danh sách hợp đồng chờ xử lý
    // Endpoint web: main/contract/receive/wait-processing
    // Endpoint API: /contracts/my-process với status = 1
    getWaitProcessingContracts: async (filterContractDTO = {}) => {
        try {
            // Chuẩn hóa dữ liệu trước khi gửi
            const body = {
                status: 1, // Luôn gửi status = 1 cho chờ xử lý
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
            };

            // Gọi API /contracts/my-process với status = 1
            const response = await apiClient.post('/contracts/my-process', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    },

    // API lấy danh sách hợp đồng đã xử lý
    // Endpoint web: main/contract/receive/processed
    // Endpoint API: /contracts/my-process với status = 2
    getProcessedContracts: async (filterContractDTO = {}) => {
        try {
            // Chuẩn hóa dữ liệu trước khi gửi
            const body = {
                status: 2, // Luôn gửi status = 2 cho đã xử lý
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
            };

            // Gọi API /contracts/my-process với status = 2
            const response = await apiClient.post('/contracts/my-process', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    },

    // API lấy danh sách hợp đồng được chia sẻ
    // Endpoint web: main/contract/receive/shared
    // Endpoint API: POST /contracts/shares
    getSharedContracts: async (filterContractDTO = {}) => {
        try {
            // Chuẩn hóa body theo format API: { status: 0, page: 0, size: 10, organizationId: 11 }
            const body = {
                status: 0, // Luôn gửi status = 0 cho API shares
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10,
                organizationId: filterContractDTO.organizationId || null
            };

            // Gọi API POST /contracts/shares với body
            const response = await apiClient.get('/contracts/shares', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    }
};

export default createdDocumentService;
