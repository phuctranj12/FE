import React, { useState } from "react";
import "../styles/MainContent.css";
import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
import Document from "../components/document/document";
import HomeComponent from "../components/document/Home";
import UserManagement from "../components/userManagement/UserManagement";
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
        return "Hệ thống quản lý hợp đồng điện tử";
    };

    // Dữ liệu mẫu hợp đồng
    const contracts = [
        {
            id: 1, name: "Hợp đồng chữ ký số - Nhân viên A", contract_no: "HD-001", status: 1, created_at: "2025-10-06T15:42:00", sign_time: "2025-10-10T00:00:00", contract_expire_time: "2025-11-05T00:00:00",
            type_id: 1,
            customer_id: 101,
            organization_id: 1001,
            is_template: false,
            notes: "Hợp đồng chữ ký số dành cho nhân viên A"
        },
        {
            id: 2, name: "Hợp đồng lao động - Nhân viên B", contract_no: "HD-002", status: 2, created_at: "2025-10-06T15:38:00", sign_time: "2025-10-09T00:00:00", contract_expire_time: "2025-11-05T00:00:00",
            type_id: 1,
            customer_id: 102,
            organization_id: 1001,
            is_template: false,
            notes: "Hợp đồng lao động chính thức"
        },
        {
            id: 3, name: "Hợp đồng cộng tác viên - Nhân viên C", contract_no: "HD-003", status: 0, created_at: "2025-10-05T14:12:00", sign_time: "2025-10-12T00:00:00", contract_expire_time: "2025-11-04T00:00:00",
            type_id: 2,
            customer_id: 103,
            organization_id: 1001,
            is_template: false,
            notes: "Bản nháp hợp đồng CTV"
        },
        {
            id: 4, name: "Hợp đồng thử việc - Nhân viên D", contract_no: "HD-004", status: 3, created_at: "2025-10-01T13:10:00", sign_time: "2025-10-08T00:00:00", contract_expire_time: "2025-11-01T00:00:00", type_id: 3,
            customer_id: 104,
            organization_id: 1001,
            is_template: false,
            notes: "Hợp đồng bị từ chối do thiếu thông tin"
        },
        {
            id: 5, name: "Hợp đồng xác thực chữ ký - Nhân viên E", contract_no: "HD-005", status: 4, created_at: "2025-10-03T09:30:00", sign_time: "2025-10-06T00:00:00", contract_expire_time: "2025-11-02T00:00:00", type_id: 4,
            customer_id: 105,
            organization_id: 1001,
            is_template: true,
            notes: "Đã hoàn thành xác thực chữ ký"
        },
        {
            id: 6, name: "Hợp đồng chờ duyệt - Nhân viên F", contract_no: "HD-006", status: 2, created_at: "2025-10-07T10:25:00", sign_time: "2025-10-11T00:00:00",
            contract_expire_time: "2025-11-06T00:00:00",
            type_id: 2,
            customer_id: 106,
            organization_id: 1001,
            is_template: false,
            notes: "Đang chờ duyệt bởi phòng nhân sự"
        },
    ];

    // ⚙️ Lọc danh sách hợp đồng theo trạng thái
    const filteredDocs =
        selectedStatus === "all" || selectedStatus === ""
            ? contracts
            : contracts.filter((doc) => doc.status === Number(selectedStatus));

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
                    ) : menuStatus === "document" ? (
                        <Document filteredDocs={filteredDocs} selectedStatus={selectedStatus} />
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
