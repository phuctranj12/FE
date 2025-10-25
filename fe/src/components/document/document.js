import React, { useState } from "react";
import "../../styles/document.css";
import "../../styles/table.css";
import AdvancedSearchModal from "./AdvancedSearchModal";

function Document({ filteredDocs = [], selectedStatus }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});

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

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("vi-VN");
    };

    // Lọc theo tên cơ bản
    let filteredByName = filteredDocs.filter(
        (doc) => doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Áp dụng thêm bộ lọc nâng cao
    if (advancedFilters.name) {
        filteredByName = filteredByName.filter((doc) =>
            doc.name.toLowerCase().includes(advancedFilters.name.toLowerCase())
        );
    }
    if (advancedFilters.contract_no) {
        filteredByName = filteredByName.filter((doc) =>
            doc.contract_no.toLowerCase().includes(advancedFilters.contract_no.toLowerCase())
        );
    }
    if (advancedFilters.fromDate) {
        filteredByName = filteredByName.filter(
            (doc) => new Date(doc.created_at) >= new Date(advancedFilters.fromDate)
        );
    }
    if (advancedFilters.toDate) {
        filteredByName = filteredByName.filter(
            (doc) => new Date(doc.created_at) <= new Date(advancedFilters.toDate)
        );
    }

    return (
        <div className="document-wrapper">
            <div className="table-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="document-title mb-0">
                        Danh sách hợp đồng:{" "}
                        {selectedStatus >= 0 ? getStatusLabel(Number(selectedStatus)) : ""}
                    </h2>
                    <button className="btn btn-outline-primary" onClick={() => setShowAdvanced(true)}>
                        Nâng cao
                    </button>
                </div>

                {/* Ô nhập tìm kiếm */}
                <div className="search-box mb-3">
                    <input
                        type="text"
                        className="search-input form-control"
                        placeholder="🔍 Tìm kiếm nhanh theo tên hợp đồng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredByName.length === 0 ? (
                    <p className="no-docs">Không có hợp đồng nào phù hợp với tìm kiếm.</p>
                ) : (
                    <table className="data-table table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Tên hợp đồng</th>
                                <th>Mã hợp đồng</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Ngày hết hạn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredByName.map((doc) => (
                                <tr key={doc.id}>
                                    <td>{doc.name}</td>
                                    <td>{doc.contract_no}</td>
                                    <td>{getStatusLabel(doc.status)}</td>
                                    <td>{formatDate(doc.created_at)}</td>
                                    <td>{formatDate(doc.contract_expire_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Popup tìm kiếm nâng cao */}
                <AdvancedSearchModal
                    show={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    onSearch={(filters) => setAdvancedFilters(filters)}
                />
            </div>
        </div>
    );
}

export default Document;
