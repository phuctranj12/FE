import apiClient from './apiClient';

const documentService = {
    getMyContracts: async (filterContractDTO = {}) => {
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

            const response = await apiClient.get('/contracts/my-contracts', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    }
};

export default documentService;
