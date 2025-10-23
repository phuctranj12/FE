// import React from "react";
// import "../../styles/document.css";
// import "../../styles/table.css";
// function Document({ filteredDocs, selectedStatus }) {
//     // Hàm chuyển đổi tên trạng thái cho hiển thị thân thiện hơn
//     const getStatusLabel = (status) => {
//         switch (status) {
//             case "ban-nhap":
//                 return "Bản nháp";
//             case "dang-xu-ly":
//                 return "Đang xử lý";
//             case "sap-het-han":
//                 return "Sắp hết hạn";
//             case "qua-han":
//                 return "Quá hạn";
//             case "tu-choi":
//                 return "Từ chối";
//             case "huy-bo":
//                 return "Hủy bỏ";
//             case "hoan-thanh":
//                 return "Hoàn thành";
//             case "thanh-ly":
//                 return "Thanh lý";
//             default:
//                 return "";
//         }
//     };

//     return (
//         <div className="document-wrapper">
//               <div className="table-container">
//             <h2>Tài liệu: {getStatusLabel(selectedStatus)}</h2>

//             {filteredDocs.length === 0 ? (
//                 <p className="no-docs">Không có tài liệu nào ở trạng thái này.</p>
//             ) : (
//                 <table className="data-table">
//                     <thead>
//                         <tr>
//                             <th>Tên tài liệu</th>
//                             <th>Trạng thái</th>
//                             <th>Thời gian tạo</th>
//                             <th>Thời gian hạn ký</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredDocs.map((doc) => (
//                             <tr key={doc.id}>
//                                 <td>{doc.title}</td>
//                                 <td>{getStatusLabel(doc.status)}</td>
//                                 <td>{doc.createdAt}</td>
//                                 <td>{doc.expired}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//         </div>

//     );
// }

// export default Document;
import React from "react";
import "../../styles/document.css";
import "../../styles/table.css";

function Document({ filteredDocs = [], selectedStatus, onDocumentClick }) {
    // Hàm đổi mã trạng thái sang tên thân thiện
    const getStatusLabel = (status) => {
        switch (status) {
            case 0:
                return "Mặc định";
            case 1:
                return "Đang xử lý";
            case 2:
                return "Đã xử lý";
            case 3:
                return "Từ chối";
            case 4:
                return "Xác thực";
            case 5:
                return "Chờ";
            default:
                return "Không xác định";
        }
    };

    // Hàm format thời gian
    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("vi-VN");
    };

    return (
        <div className="document-wrapper">
            <div className="table-container">
                <h2 className="document-title">
                    Danh sách tài liệu: {selectedStatus ? getStatusLabel(selectedStatus) : "Tất cả"}
                </h2>

                {filteredDocs.length === 0 ? (
                    <p className="no-docs">Không có tài liệu nào ở trạng thái này.</p>
                ) : (
                    <table className="data-table">
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
                                <tr key={doc.id} className="document-row" onClick={() => onDocumentClick && onDocumentClick(doc)}>
                                    <td className="document-title-cell">{doc.title}</td>
                                    <td>{getStatusLabel(doc.status)}</td>
                                    <td>{formatDate(doc.createdAt)}</td>
                                    <td>{formatDate(doc.expired)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Document;
