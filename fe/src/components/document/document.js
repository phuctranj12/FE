import React, { useState, useEffect } from "react";
import "../../styles/document.css";
import "../../styles/table.css";
import Button from "../common/Button";
import AdvancedSearchModal from "./AdvancedSearchModal";
import ActionMenu from "./ActionMenu";
import SearchBar from "../common/SearchBar";
import documentService from "../../api/documentService";
import { useNavigate } from "react-router-dom";

function Document({ selectedStatus = "all", onDocumentClick }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [docs, setDocs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const totalPages = Math.ceil(totalDocs / itemsPerPage);

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

    const fetchDocuments = async () => {
        setErrorMessage("");

        // Lấy filter
        const filter = {
            status: selectedStatus === "all" ? undefined : selectedStatus,
            textSearch: searchTerm,
            fromDate: advancedFilters.fromDate || "",
            toDate: advancedFilters.toDate || "",
            page: currentPage - 1,
            size: itemsPerPage,
            // organizationId bỏ đi
        };

        try {
            const data = await documentService.getMyContracts(filter);
            const { list, total } = extractListAndTotal(data);
            setDocs(list);
            setTotalDocs(total);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErrorMessage("Bạn chưa đăng nhập hoặc token đã hết hạn.");
                } else {
                    setErrorMessage(`Lỗi server: ${error.response.status}`);
                }
            } else if (error.message === "Network Error") {
                setErrorMessage("Không thể kết nối tới server. Vui lòng kiểm tra mạng hoặc server.");
            } else {
                setErrorMessage("Đã xảy ra lỗi không xác định.");
            }
            setDocs([]);
            setTotalDocs(0);
        }
    };

    // Gọi API khi filter/search/page thay đổi
    useEffect(() => {
        fetchDocuments();
    }, [searchTerm, selectedStatus, advancedFilters, currentPage]);

    // Reset trang khi filter/search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, advancedFilters]);
    const navigate = useNavigate();

    const handleEdit = (doc) => {
        if (!doc?.id) return;

        // Map status thành slug để gắn vào URL
        const statusMap = {
            0: "draft",
            1: "processing",
            2: "complete",
            3: "fail",
            4: "validate",
            5: "waiting",
        };

        const statusSlug = statusMap[doc.status] || "unknown";

        navigate(`/main/contract/create/${statusSlug}/${doc.id}`);
    };


    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return "Bản nháp";
            case 1: return "Đang xử lý";
            case 2: return "Đã xử lý";
            case 3: return "Từ chối";
            case 4: return "Xác thực";
            case 5: return "Chờ";
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

    return (
        <div className="document-wrapper">
            <div className="table-container">
                <div>
                    <h2>
                        Danh sách tài liệu{" "}
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

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                {docs.length === 0 && !errorMessage ? (
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
                                {docs.map(doc => (
                                    <tr
                                        key={doc.id}
                                        className="document-row"
                                        onClick={() => onDocumentClick && onDocumentClick(doc)}
                                    >
                                        <td className="document-title-cell">{doc.name}</td>
                                        <td>{doc.id}</td>
                                        <td>{getTypeLabel(doc.type)}</td>
                                        <td>{getStatusLabel(doc.status)}</td>
                                        <td>{formatDate(doc.created_at)}</td>
                                        <td>{formatDate(doc.updated_at)}</td>
                                        <td>
                                            <ActionMenu
                                                onEdit={handleEdit}
                                                onViewFlow={() => console.log("Xem luồng ký", doc.id)}
                                                onCopy={() => console.log("Sao chép", doc.id)}
                                                onDelete={() => console.log("Xóa tài liệu có id:", doc.id)}
                                                doc={doc}
                                            />
                                        </td>
                                    </tr>
                                ))}
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

export default Document;
