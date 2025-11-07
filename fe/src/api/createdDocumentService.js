import axios from "axios";

const BASE_URL = "http://localhost:8084/api/contracts";

const getMyProcessContracts = async (filterContractDTO) => {
    // Chuyển object filterContractDTO thành query string
    const params = new URLSearchParams({
        status: filterContractDTO.status || 0,
        textSearch: filterContractDTO.textSearch || "",
        fromDate: filterContractDTO.fromDate || "",
        toDate: filterContractDTO.toDate || "",
        page: filterContractDTO.page || 0,
        size: filterContractDTO.size || 5,
        organizationId: filterContractDTO.organizationId || 0
    }).toString();

    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/my-process?${params}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined
        }
    });

    return response.data.data; // Lấy phần data theo backend
};

export default {
    getMyProcessContracts
};
