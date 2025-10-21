import React, { useState } from "react";
import "../styles/MainContent.css";
import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
import Document from "../components/document/document";
import HomeComponent from "../components/document/Home";
import UserManagement from "../components/userManagement/UserManagement";
import DocumentForm from "../components/document/DocumentForm";
import Footer from "../components/bar/Footer";
function MainContent() {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [menuStatus, setMenuStatus] = useState("home");

    const getBreadcrumb = () => {
        if (menuStatus === "create-document") {
            return "Tạo tài liệu mới";
        }
        if (menuStatus === "user-management") {
            if (selectedStatus === "to-chuc") return "Quản lý người dùng > Danh sách tổ chức";
            if (selectedStatus === "nguoi-dung") return "Quản lý người dùng > Danh sách người dùng";
            if (selectedStatus === "vai-tro") return "Quản lý người dùng > Danh sách vai trò";
            return "Quản lý người dùng";
        }
        return "Hệ thống quản lý hợp đồng điện tử";
    };

    // Dữ liệu mẫu
    const documents = [
        { id: 1, title: "Hợp đồng chữ ký số - Nhân viên A", status: 1, createdAt: "2025-10-06T15:42:00", expired: "2025-11-05T00:00:00" },
        { id: 2, title: "Hợp đồng lao động - Nhân viên B", status: 2, createdAt: "2025-10-06T15:38:00", expired: "2025-11-05T00:00:00" },
        { id: 3, title: "Hợp đồng cộng tác viên - Nhân viên C", status: 0, createdAt: "2025-10-05T14:12:00", expired: "2025-11-04T00:00:00" },
        { id: 4, title: "Hợp đồng thử việc - Nhân viên D", status: 3, createdAt: "2025-10-01T13:10:00", expired: "2025-11-01T00:00:00" },
        { id: 5, title: "Hợp đồng xác thực chữ ký - Nhân viên E", status: 4, createdAt: "2025-10-03T09:30:00", expired: "2025-11-02T00:00:00" },
        { id: 6, title: "Hợp đồng chờ duyệt - Nhân viên F", status: 5, createdAt: "2025-10-07T10:25:00", expired: "2025-11-06T00:00:00" },
    ];


    // ⚙️ Lọc danh sách tài liệu theo trạng thái hiện tại
    const filteredDocs = selectedStatus === "all"
        ? documents
        : documents.filter((doc) => doc.status === Number(selectedStatus));


    return (
        <div className="main-container">
            <Header breadcrumb={getBreadcrumb()} />

            <div className="content-body">
                {/* Sidebar truyền callback để thay đổi trạng thái */}
                <Sidebar
                    setSelectedStatus={setSelectedStatus}
                    selectedStatus={selectedStatus}
                    setMenuStatus={setMenuStatus}
                    menuStatus={menuStatus}
                />

                {/* Document nhận danh sách tài liệu đã lọc */}
                <div className="content-right">
                    {menuStatus === "home" ? (
                        <HomeComponent />
                    ) : menuStatus === "document" ? (
                        <Document
                            filteredDocs={filteredDocs}
                            selectedStatus={selectedStatus}
                        />
                    ) : menuStatus === "user-management" ? (
                        <UserManagement selectedStatus={selectedStatus} />
                    ) : menuStatus === "create-document" ? (
                        <DocumentForm />
                    ) : (
                        null
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MainContent;


