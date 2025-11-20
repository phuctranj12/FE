import apiClient from './apiClient';

const documentService = {
    getMyContracts: async (filterContractDTO = {}) => {
        try {
            // Chuẩn hóa dữ liệu trước khi gửi
            const body = {
                ...(typeof filterContractDTO.status === 'number' ? { status: filterContractDTO.status } : {}),
                textSearch: filterContractDTO.textSearch ?? "",
                fromDate: filterContractDTO.fromDate || null,
                toDate: filterContractDTO.toDate || null,
                page: filterContractDTO.page ?? 0,
                size: filterContractDTO.size ?? 10
                // organizationId bỏ 
            };

            const response = await apiClient.post('/contracts/my-contracts', body);
            return response; // apiClient trả về data
        } catch (error) {
            throw error;
        }
    },
    getContractById: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Put Change Status /{contractId}/change-status/{new-status}
    changeContractStatus: async (contractId, newStatus, reason) => {
        try {
            const body = { reason }; // swagger yêu cầu body có reason

            const response = await apiClient.put(
                `/contracts/${contractId}/change-status/${newStatus}`,
                body
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    //  PUT: Update contract - /update-contract/{contractId}
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
    }
};

export default documentService;
