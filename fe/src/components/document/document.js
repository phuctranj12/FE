import React from "react";
import "../../styles/document.css";

function Document({ filteredDocs, selectedStatus }) {
    // Hàm chuyển đổi tên trạng thái cho hiển thị thân thiện hơn
    const getStatusLabel = (status) => {
        switch (status) {
            case "ban-nhap":
                return "Bản nháp";
            case "dang-xu-ly":
                return "Đang xử lý";
            case "sap-het-han":
                return "Sắp hết hạn";
            case "qua-han":
                return "Quá hạn";
            case "tu-choi":
                return "Từ chối";
            case "huy-bo":
                return "Hủy bỏ";
            case "hoan-thanh":
                return "Hoàn thành";
            case "thanh-ly":
                return "Thanh lý";
            default:
                return "";
        }
    };

    return (
        <div className="main-content">
            <h2>Tài liệu: {getStatusLabel(selectedStatus)}</h2>

            {filteredDocs.length === 0 ? (
                <p className="no-docs">Không có tài liệu nào ở trạng thái này.</p>
            ) : (
                <table className="docs-table">
                    <thead>
                        <tr>
                            <th>Tên tài liệu</th>
                            <th>Trạng thái</th>
                            <th>Thời gian tạo</th>
                            <th>Thời gian hạn ký</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocs.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.title}</td>
                                <td>{getStatusLabel(doc.status)}</td>
                                <td>{doc.createdAt}</td>
                                <td>{doc.expired}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Document;
