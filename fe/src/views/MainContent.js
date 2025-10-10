import React, { useState } from "react";
import "../styles/MainContent.css";
import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
import Document from "../components/document/document";

function MainContent() {
    const [selectedStatus, setSelectedStatus] = useState("Đang xử lý");

    // Dữ liệu mẫu
    const documents = [
        { id: 1, title: "Test nhập 2", status: "dang-xu-ly", createdAt: "06/10/2025 15:42", expired: "05/11/2025" },
        { id: 2, title: "Test người nhập", status: "dang-xu-ly", createdAt: "06/10/2025 15:38", expired: "05/11/2025" },
        { id: 3, title: "Hợp đồng thử việc_005", status: "ban-nhap", createdAt: "05/10/2025 14:12", expired: "04/11/2025" },
        { id: 4, title: "Hợp đồng thử việc_004", status: "hoan-thanh", createdAt: "01/10/2025 13:10", expired: "01/11/2025" },
    ];

    // ⚙️ Lọc danh sách tài liệu theo trạng thái hiện tại
    const filteredDocs = documents.filter((doc) => doc.status === selectedStatus);

    return (
        <div className="main-container">
            <Header />

            <div className="content-body">
                {/* Sidebar truyền callback để thay đổi trạng thái */}
                <Sidebar
                    setSelectedStatus={setSelectedStatus}
                    selectedStatus={selectedStatus}
                />

                {/* Document nhận danh sách tài liệu đã lọc */}
                <div className="content-right">
                    <Document
                        filteredDocs={filteredDocs}
                        selectedStatus={selectedStatus}
                    />
                </div>
            </div>
        </div>
    );
}

export default MainContent;


{/* <div className="content-main">
                    <div className="toolbar">
                        <input
                            type="text"
                            placeholder="Nhập từ khóa tìm kiếm theo tên tài liệu, mã tài liệu..."
                        />
                        <button>Nâng cao</button>
                        <button>Phát hành</button>
                        <button>Xóa nhiều</button>
                    </div>

                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Tài liệu</th>
                                <th>Trạng thái tài liệu</th>
                                <th>Thời gian tạo</th>
                                <th>Thời gian cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>TL CHECK HSM</td>
                                <td><span className="status">Bản nháp</span></td>
                                <td>08/08/2025 17:19:28</td>
                                <td>08/08/2025 17:19:28</td>
                            </tr>
                            <tr>
                                <td>TL CHECK HSM NGOÀI HỆ THỐNG</td>
                                <td><span className="status">Bản nháp</span></td>
                                <td>04/08/2025 14:04:19</td>
                                <td>04/08/2025 14:04:19</td>
                            </tr>
                           
                        </tbody>
                    </table>
                </div> */}