import React, { useState } from "react";
import "../styles/MainContent.css";
import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
import Document from "../components/document/document";
import HomeComponent from "../components/document/Home";
import UserManagement from "../components/userManagement/UserManagement";
import DocumentTemplates from "../components/templateContract/DocumentTemplates";
import DocumentForm from "../components/createContract/DocumentForm";
import Footer from "../components/bar/Footer";

function MainContent() {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [menuStatus, setMenuStatus] = useState("home");

    const getBreadcrumb = () => {
        if (menuStatus === "user-management") {
            if (selectedStatus === "to-chuc") return "Quản lý người dùng > Danh sách tổ chức";
            if (selectedStatus === "nguoi-dung") return "Quản lý người dùng > Danh sách người dùng";
            if (selectedStatus === "vai-tro") return "Quản lý người dùng > Danh sách vai trò";
            return "Quản lý người dùng";
        }
        if (menuStatus === "tai-lieu-mau") {
            return "Tài liệu mẫu";
        }
        if (menuStatus === "create-document") {
            return "Tạo tài liệu mới";
        }
        return "Hệ thống quản lý hợp đồng điện tử";
    };

    // Dữ liệu mẫu hợp đồng
    const documents = [
        {
            id: 1,
            name: "Tài liệu gốc - Hợp đồng chữ ký số",
            path: "/uploads/docs/file1.pdf",
            status: 1,
            type: 1,
            contract_id: 101,
            created_at: "2025-10-06T15:42:00",
            created_by: 10,
            updated_at: "2025-10-07T09:30:00",
            updated_by: 10,
            filename: "hopdong_chukyso.pdf",
            bucket: "main-bucket",
            recipient_id: 20,
        },
        {
            id: 2,
            name: "Tài liệu đính kèm - Phụ lục hợp đồng B",
            path: "/uploads/docs/file2.pdf",
            status: 2,
            type: 3,
            contract_id: 102,
            created_at: "2025-10-05T13:20:00",
            created_by: 11,
            updated_at: "2025-10-06T11:15:00",
            updated_by: 11,
            filename: "phuluc_hd_B.pdf",
            bucket: "main-bucket",
            recipient_id: 22,
        },
        {
            id: 3,
            name: "File backup hợp đồng C",
            path: "/uploads/docs/file3.zip",
            status: 0,
            type: 6,
            contract_id: 103,
            created_at: "2025-10-08T10:00:00",
            created_by: 12,
            updated_at: "2025-10-09T08:30:00",
            updated_by: 12,
            filename: "backup_hd_C.zip",
            bucket: "archive",
            recipient_id: 23,
        },
        {
            id: 4,
            name: "Ảnh E-KYC khách hàng D",
            path: "/uploads/docs/file4.jpg",
            status: 3,
            type: 7,
            contract_id: 104,
            created_at: "2025-10-04T09:10:00",
            created_by: 13,
            updated_at: "2025-10-05T09:00:00",
            updated_by: 13,
            filename: "ekyc_kh_D.jpg",
            bucket: "ekyc-images",
            recipient_id: 24,
        },
        {
            id: 5,
            name: "File tracking hợp đồng E",
            path: "/uploads/docs/file5.log",
            status: 4,
            type: 8,
            contract_id: 105,
            created_at: "2025-10-03T15:40:00",
            created_by: 14,
            updated_at: "2025-10-05T16:10:00",
            updated_by: 14,
            filename: "tracking_hd_E.log",
            bucket: "logs",
            recipient_id: 25,
        },
    ];

    // ⚙️ Lọc danh sách tài liệu theo trạng thái
    const filteredDocs =
        selectedStatus === "all" || selectedStatus === ""
            ? documents
            : documents.filter((doc) => doc.status === Number(selectedStatus));

    return (
        <div className="main-container">
            <Header breadcrumb={getBreadcrumb()} />

            <div className="content-body">
                <Sidebar
                    setSelectedStatus={setSelectedStatus}
                    selectedStatus={selectedStatus}
                    setMenuStatus={setMenuStatus}
                    menuStatus={menuStatus}
                />

                <div className="content-right">
                    {menuStatus === "home" ? (
                        <HomeComponent />
                    ) : menuStatus === "create-document" ? (
                        <DocumentForm />
                    ) : menuStatus === "document" ? (
                        <Document filteredDocs={filteredDocs} selectedStatus={selectedStatus} />
                    ) : menuStatus === "tai-lieu-mau" ? (
                        <DocumentTemplates />
                    ) : menuStatus === "user-management" ? (
                        <UserManagement selectedStatus={selectedStatus} />
                    ) : null}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default MainContent;
