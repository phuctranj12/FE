import { useState } from "react";
import "../../styles/document.css";
import "../../styles/table.css";
import Button from "../common/Button";
import AdvancedSearchModal from "./AdvancedSearchModal";
import ActionMenu from "./ActionMenu";
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
                <div>
                    <h2 >
                        Danh sách hợp đồng:{" "}
                        {selectedStatus >= 0 ? getStatusLabel(Number(selectedStatus)) : ""}
                    </h2>

                </div>
                <div className="documnent-head">
                    <input
                        type="text"

                        placeholder="Tìm kiếm nhanh theo tên hợp đồng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="rgb(11, 87, 208)"
                        text="Nâng cao"
                        onClick={() => setShowAdvanced(true)}
                    />
                </div>

                {/* Ô nhập tìm kiếm */}


                {
                    filteredByName.length === 0 ? (
                        <p className="no-docs">Không có hợp đồng nào phù hợp với tìm kiếm.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tên hợp đồng</th>
                                    <th>Mã hợp đồng</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Thao tác</th>
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
                                        <td>
                                            <ActionMenu
                                                onEdit={() => console.log("Sửa", doc.id)}
                                                onViewFlow={() => console.log("Xem luồng ký", doc.id)}
                                                onCopy={() => console.log("Sao chép", doc.id)}
                                                onDelete={(id) => {
                                                    console.log("Xóa tài liệu có id:", id);
                                                    // gọi API xóa ở đây
                                                    // fetch(`/api/documents/${id}`, { method: "DELETE" })
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }

                {/* Popup tìm kiếm nâng cao */}
                <AdvancedSearchModal
                    show={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    onSearch={(filters) => setAdvancedFilters(filters)}
                />
            </div >
        </div >
    );
}

export default Document;
