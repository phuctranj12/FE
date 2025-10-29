import React, { useState, useEffect } from "react";
import "../../styles/document.css";
import "../../styles/table.css";
import Button from "../common/Button";
import AdvancedSearchModal from "./AdvancedSearchModal";
import ActionMenu from "./ActionMenu";
import SearchBar from "../common/SearchBar";

function Document({ filteredDocs = [], selectedStatus, onDocumentClick }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [docs, setDocs] = useState(filteredDocs);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDocs = docs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(docs.length / itemsPerPage);

    // Reset trang khi filter/search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, advancedFilters]);

    // Cập nhật khi props thay đổi
    useEffect(() => {
        setDocs(filteredDocs);
    }, [filteredDocs]);

    // Áp dụng lọc nâng cao + search + status
    useEffect(() => {
        let filtered = [...filteredDocs];

        if (selectedStatus && selectedStatus !== "all") {
            filtered = filtered.filter((doc) => doc.status === Number(selectedStatus));
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter((doc) =>
                doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (advancedFilters) {
            const { name, type, fromDate, toDate } = advancedFilters;

            if (name && name.trim()) {
                filtered = filtered.filter((doc) =>
                    doc.name?.toLowerCase().includes(name.toLowerCase())
                );
            }

            if (type && type !== "all") {
                filtered = filtered.filter((doc) => String(doc.type) === String(type));
            }

            if (fromDate) {
                filtered = filtered.filter((doc) => new Date(doc.created_at) >= new Date(fromDate));
            }

            if (toDate) {
                filtered = filtered.filter((doc) => new Date(doc.created_at) <= new Date(toDate));
            }
        }

        setDocs(filtered);
    }, [searchTerm, selectedStatus, advancedFilters, filteredDocs]);

    // Chuyển status code sang tên
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

    // Chuyển type code sang tên
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

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("vi-VN");
    };

    const handleAdvancedSearch = (filters) => {
        if (!filters || Object.values(filters).every((v) => v === "" || v === "all" || v === null)) {
            setAdvancedFilters({});
            setDocs(filteredDocs);
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
                                {currentDocs.map((doc) => (
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
                                                onEdit={() => console.log("Sửa", doc.id)}
                                                onViewFlow={() => console.log("Xem luồng ký", doc.id)}
                                                onCopy={() => console.log("Sao chép", doc.id)}
                                                onDelete={(id) => console.log("Xóa tài liệu có id:", id)}
                                                doc={doc}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {docs.length > itemsPerPage && (
                            <div className="pagination">
                                {/* <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    ←
                                </button> */}

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

                                {/* <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    →
                                </button> */}
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
