import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/document.css";
import "../../styles/table.css";
import Button from "../common/Button";
import AdvancedSearchModal from "./AdvancedSearchModal";
import ActionMenu from "./ActionMenu";
import SearchBar from "../common/SearchBar";
import createdDocumentService from "../../api/createdDocumentService";
import customerService from "../../api/customerService";
import contractService from "../../api/contractService";

function CreatedDocument({ selectedStatus, onDocumentClick }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [docs, setDocs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [organizationId, setOrganizationId] = useState(null);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    // Map lưu role và recipientId cho mỗi contract: { contractId: { role, recipientId } }
    const [contractRoles, setContractRoles] = useState({});
    const [loadingRoles, setLoadingRoles] = useState(false);

    const totalPages = Math.ceil(totalDocs / itemsPerPage);

    // Lấy organizationId và email từ user token khi component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await customerService.getCustomerByToken();
                if (response.code === 'SUCCESS' && response.data) {
                    const orgId = response.data.organizationId;
                    const email = response.data.email;
                    if (orgId) {
                        setOrganizationId(orgId);
                    }
                    if (email) {
                        setCurrentUserEmail(email);
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };
        fetchUserInfo();
    }, []);

    const extractListAndTotal = (response) => {
        const payload = response?.data ?? response ?? {};
        const nested = payload?.data ?? {};
        const list =
            Array.isArray(payload)
                ? payload
                : Array.isArray(payload.content)
                    ? payload.content
                    : Array.isArray(payload.items)
                        ? payload.items
                        : Array.isArray(nested)
                            ? nested
                            : Array.isArray(nested.content)
                                ? nested.content
                                : Array.isArray(nested.items)
                                    ? nested.items
                                    : [];
        const total =
            typeof payload.total === "number" ? payload.total :
            typeof payload.totalElements === "number" ? payload.totalElements :
            typeof nested.total === "number" ? nested.total :
            typeof nested.totalElements === "number" ? nested.totalElements :
            list.length;
        return { list, total };
    };

    // Hàm lấy role và recipientId cho một contract
    const fetchContractRole = async (contractId) => {
        if (!currentUserEmail) return null;
        
        try {
            const contractResponse = await contractService.getContractById(contractId);
            if (contractResponse?.code === 'SUCCESS' && contractResponse.data) {
                const contract = contractResponse.data;
                
                // Tìm recipient của user hiện tại trong contract
                let userRecipient = null;
                let userRole = null;
                
                contract.participants?.forEach(participant => {
                    participant.recipients?.forEach(recipient => {
                        // So sánh email để tìm user hiện tại
                        if (recipient.email === currentUserEmail) {
                            userRecipient = recipient;
                            userRole = recipient.role;
                        }
                    });
                });
                
                if (userRecipient && userRole) {
                    return {
                        role: userRole,
                        recipientId: userRecipient.id
                    };
                }
            }
        } catch (error) {
            console.error(`Error fetching role for contract ${contractId}:`, error);
        }
        return null;
    };

    const fetchDocuments = async () => {
        const filter = {
            status: selectedStatus === "all" ? 0 : selectedStatus,
            textSearch: searchTerm,
            fromDate: advancedFilters.fromDate || "",
            toDate: advancedFilters.toDate || "",
            page: currentPage - 1,
            size: itemsPerPage,
            organizationId: organizationId // Thêm organizationId vào filter
        };

        try {
            let response;
            // Gọi API tương ứng với selectedStatus
            if (selectedStatus === "cho-xu-ly") {
                // Chờ xử lý: status = 1
                response = await createdDocumentService.getWaitProcessingContracts(filter);
            } else if (selectedStatus === "da-xu-ly") {
                // Đã xử lý: status = 2
                response = await createdDocumentService.getProcessedContracts(filter);
            } else if (selectedStatus === "duoc-chia-se") {
                // Được chia sẻ: gọi API shares với organizationId
                response = await createdDocumentService.getSharedContracts(filter);
            } else {
                response = await createdDocumentService.getCreatedContracts(filter);
            }
            const { list, total } = extractListAndTotal(response);
            setDocs(list);
            setTotalDocs(total);
            
            // Nếu là "cho-xu-ly" và có user email, fetch role cho mỗi contract
            if (selectedStatus === "cho-xu-ly" && currentUserEmail && list.length > 0) {
                setLoadingRoles(true);
                try {
                    const rolePromises = list.map(doc => 
                        fetchContractRole(doc.id).then(roleInfo => ({
                            contractId: doc.id,
                            roleInfo
                        }))
                    );
                    const roleResults = await Promise.all(rolePromises);
                    const rolesMap = {};
                    roleResults.forEach(({ contractId, roleInfo }) => {
                        if (roleInfo) {
                            rolesMap[contractId] = roleInfo;
                        }
                    });
                    setContractRoles(rolesMap);
                } catch (error) {
                    console.error("Error fetching contract roles:", error);
                } finally {
                    setLoadingRoles(false);
                }
            } else {
                // Reset roles khi không phải "cho-xu-ly"
                setContractRoles({});
            }
        } catch (error) {
            console.error("Lấy tài liệu thất bại:", error);
            setDocs([]);
            setTotalDocs(0);
        }
    };

    useEffect(() => {
        // Đối với "duoc-chia-se", cần đợi organizationId
        // Đối với "cho-xu-ly", cần đợi currentUserEmail
        // Các trường hợp khác có thể fetch ngay
        if (selectedStatus === "duoc-chia-se") {
            if (organizationId !== null) {
                fetchDocuments();
            }
        } else if (selectedStatus === "cho-xu-ly") {
            if (currentUserEmail) {
                fetchDocuments();
            }
        } else {
            fetchDocuments();
        }
    }, [searchTerm, selectedStatus, advancedFilters, currentPage, organizationId, currentUserEmail]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, advancedFilters]);

    const getStatusLabel = (status) => {
        switch (status) {
            case 2: return "Đã xử lý";
            case 1: return "Chờ";
            default: return "";
        }
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            1: "Tài liệu gốc",
            2: "Tài liệu khách hàng",
            3: "Tài liệu đính kèm",
            4: "Tài liệu hợp đồng theo lô",
            5: "Tài liệu hoàn thành được nén lại",
            6: "Tài liệu backup hợp đồng",
            7: "Tài liệu ảnh eKYC",
            8: "Tài liệu tracking theo hợp đồng"
        };
        return typeMap[Number(type)] || "Không xác định";
    };

    const formatDate = (date) => date ? new Date(date).toLocaleString("vi-VN") : "";

    const handleAdvancedSearch = (filters) => {
        if (!filters || Object.values(filters).every(v => v === "" || v === "all" || v === null)) {
            setAdvancedFilters({});
            return;
        }
        setAdvancedFilters(filters);
    };

    // Hàm xử lý click button dựa trên role
    const handleRoleAction = (contractId, role, recipientId) => {
        if (!recipientId) {
            console.error("RecipientId not found for contract:", contractId);
            return;
        }

        let routeType = '';
        if (role === 1) {
            routeType = 'coordinate'; // Điều phối
        } else if (role === 2) {
            routeType = 'review'; // Xem xét
        } else if (role === 3) {
            routeType = 'sign'; // Ký
        } else if (role === 4) {
            routeType = 'detail'; // Văn thư - mở chi tiết
        } else {
            // Nếu role không xác định, mở chi tiết
            navigate(`/main/c/detail/${contractId}?recipientId=${recipientId}`);
            return;
        }

        navigate(`/main/c/${routeType}/${contractId}?recipientId=${recipientId}`);
    };

    // Hàm lấy text button dựa trên role
    const getRoleButtonText = (role) => {
        switch (role) {
            case 1:
                return 'Điều phối';
            case 2:
                return 'Xem xét';
            case 3:
                return 'Ký';
            case 4:
                return 'Văn thư';
            default:
                return 'Xem chi tiết';
        }
    };

    return (
        <div className="document-wrapper">
            <div className="table-container">
                <div>
                    <h2>
                        Danh sách tài liệu đã nhận{" "}
                        {selectedStatus !== "all" && selectedStatus !== undefined
                            ? `(${getStatusLabel(Number(selectedStatus))})`
                            : ""}
                    </h2>
                </div>

                <div className="documnent-head">
                    <SearchBar
                        placeholder="Tìm kiếm nhanh theo tên tài liệu..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="rgb(11, 87, 208)"
                        text="Nâng cao"
                        onClick={() => setShowAdvanced(true)}
                    />
                </div>

                {docs.length === 0 ? (
                    <p className="no-docs">Không có tài liệu nào phù hợp với tìm kiếm.</p>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Mã hợp đồng</th>
                                    <th>Loại tài liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Thời gian tạo</th>
                                    <th>Thời gian cập nhật</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map(doc => {
                                    const roleInfo = contractRoles[doc.id];
                                    const isWaitProcessing = selectedStatus === "cho-xu-ly";
                                    
                                    return (
                                        <tr
                                            key={doc.id}
                                            className="document-row"
                                            onClick={() => {
                                                // Chỉ trigger onDocumentClick nếu không phải "cho-xu-ly" hoặc không có role button
                                                if (!isWaitProcessing || !roleInfo) {
                                                    onDocumentClick && onDocumentClick(doc);
                                                }
                                            }}
                                        >
                                            <td className="document-title-cell">{doc.name}</td>
                                            <td>{doc.id}</td>
                                            <td>{getTypeLabel(doc.type)}</td>
                                            <td>{getStatusLabel(doc.status)}</td>
                                            <td>{formatDate(doc.created_at)}</td>
                                            <td>{formatDate(doc.updated_at)}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {isWaitProcessing && roleInfo ? (
                                                    <button
                                                        className="role-action-button"
                                                        onClick={() => handleRoleAction(doc.id, roleInfo.role, roleInfo.recipientId)}
                                                        disabled={loadingRoles}
                                                        style={{
                                                            padding: '6px 16px',
                                                            backgroundColor: '#0B57D0',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: loadingRoles ? 'not-allowed' : 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            opacity: loadingRoles ? 0.6 : 1
                                                        }}
                                                    >
                                                        {loadingRoles ? 'Đang tải...' : getRoleButtonText(roleInfo.role)}
                                                    </button>
                                                ) : (
                                                    <ActionMenu
                                                        onEdit={() => console.log("Sửa", doc.id)}
                                                        onViewFlow={() => console.log("Xem luồng ký", doc.id)}
                                                        onCopy={() => console.log("Sao chép", doc.id)}
                                                        onDelete={() => console.log("Xóa tài liệu có id:", doc.id)}
                                                        doc={doc}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {totalDocs > itemsPerPage && (
                            <div className="pagination">
                                <div className="page-info">
                                    <span>Trang</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => {
                                            let page = Number(e.target.value);
                                            if (page < 1) page = 1;
                                            if (page > totalPages) page = totalPages;
                                            setCurrentPage(page);
                                        }}
                                    />
                                    <span>/ {totalPages}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <AdvancedSearchModal
                    show={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    onSearch={handleAdvancedSearch}
                />
            </div>
        </div>
    );
}

export default CreatedDocument;
