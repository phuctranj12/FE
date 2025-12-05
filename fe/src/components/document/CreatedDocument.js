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

function CreatedDocument({ selectedStatus, onDocumentClick }) {
    const mockDocuments = [
        {
            id: 101,
            name: "Hợp đồng lao động số 01",
            contractNo: "HD-2025-001",
            status: 20, // Đang xử lý
            createdAt: "2025-01-12T10:23:00",
            updatedAt: "2025-01-12T15:40:00",
            type: 1,
            participants: [
                {
                    id: 1,
                    recipients: [
                        { id: 999, email: "example@gmail.com", role: 3 } // Vai trò ký
                    ]
                }
            ]
        }
    ];

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

    // Xây map role/recipientId cho mỗi contract trực tiếp từ response my-process
    const buildContractRolesFromList = (list, email) => {
        if (!email) return {};
        const rolesMap = {};

        list.forEach(contract => {
            if (!contract?.participants) return;

            let found = null;

            contract.participants.forEach(participant => {
                if (found || !participant?.recipients) return;
                participant.recipients.forEach(recipient => {
                    if (found) return;
                    if (recipient?.email === email && recipient?.role && recipient?.id) {
                        found = {
                            role: recipient.role,
                            recipientId: recipient.id
                        };
                    }
                });
            });

            if (found) {
                rolesMap[contract.id] = found;
            }
        });

        return rolesMap;
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
            // setDocs(list);
            // setTotalDocs(total);
            setDocs(mockDocuments);
            setTotalDocs(1);


            // Nếu là "cho-xu-ly" và có user email, derive role trực tiếp từ list (không call thêm API)
            if (selectedStatus === "cho-xu-ly" && currentUserEmail && list.length > 0) {
                setLoadingRoles(true);
                const rolesMap = buildContractRolesFromList(list, currentUserEmail);
                setContractRoles(rolesMap);
                setLoadingRoles(false);
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

    const getSelectedStatusLabel = (status) => {
        switch (status) {
            case "cho-xu-ly": return "Chờ xử lý";
            case "da-xu-ly": return "Đã xử lý";
            case "duoc-chia-se": return "Được chia sẻ";
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
    const getContractStatusLabel = (status) => {
        const map = {
            0: "Nháp",
            10: "Đã tạo",
            20: "Đang xử lý",
            30: "Hoàn thành",
            40: "Thanh lý",
            31: "Từ chối",
            32: "Huỷ bỏ",
            1: "Sắp hết hạn",
            2: "Hết hạn"
        };

        return map[status] || "Không xác định";
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
                            ? `(${getSelectedStatusLabel(selectedStatus)})`
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
                                    <th style={{ textAlign: "center" }}>Tên tài liệu</th>
                                    <th>Số tài liệu</th>
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
                                                if (isWaitProcessing && roleInfo) {
                                                    // Ở danh sách chờ xử lý: click cả dòng = click button vai trò
                                                    handleRoleAction(
                                                        doc.id,
                                                        roleInfo.role,
                                                        roleInfo.recipientId
                                                    );
                                                    return;
                                                }

                                                // Các trạng thái khác: giữ behavior cũ
                                                if (onDocumentClick) {
                                                    onDocumentClick(doc);
                                                    return;
                                                }

                                                const isProcessed =
                                                    selectedStatus === "da-xu-ly" || doc.status === 2;
                                                const queryParam = isProcessed ? '' : '?showAllFields=1';
                                                navigate(`/main/c/detail/${doc.id}${queryParam}`);
                                            }}
                                        >
                                            <td className="document-title-cell">
                                                <div className="svg-container">
                                                    <div className="svg-bg">
                                                        <svg
                                                            className="contract-icon"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                                                stroke="url(#gradient)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <polyline
                                                                points="14 2 14 8 20 8"
                                                                stroke="url(#gradient)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <line
                                                                x1="8"
                                                                y1="12"
                                                                x2="16"
                                                                y2="12"
                                                                stroke="url(#gradient)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                            <line
                                                                x1="8"
                                                                y1="16"
                                                                x2="16"
                                                                y2="16"
                                                                stroke="url(#gradient)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                            <line
                                                                x1="8"
                                                                y1="20"
                                                                x2="12"
                                                                y2="20"
                                                                stroke="url(#gradient)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                            <defs>
                                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#0B57D0" stopOpacity="0.8" />
                                                                    <stop offset="100%" stopColor="#9333EA" stopOpacity="0.8" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </div>
                                                    <div className="doc-name">{doc.name}</div>
                                                </div>
                                            </td>
                                            <td>{doc.contractNo || "-"}</td>
                                            <td>
                                                <span className={`status-badge status-${doc.status}`}>
                                                    {getContractStatusLabel(doc.status)}
                                                </span>
                                            </td>
                                            <td>{formatDate(doc.createdAt)}</td>
                                            <td>{formatDate(doc.updatedAt)}</td>
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
