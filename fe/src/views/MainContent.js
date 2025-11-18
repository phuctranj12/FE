import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/MainContent.css";
import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
import Document from "../components/document/document";
import DashboardHome from "../components/dashboard/DashboardHome";
import UserManagement from "../components/userManagement/UserManagement";
import DocumentTemplates from "../components/templateContract/DocumentTemplates";
import DocumentForm from "../components/createContract/DocumentForm";
import Footer from "../components/bar/Footer";
import ServerCertificateList from "../components/certificate/ServerCertificateList";
import documentService from "../api/documentService";
function MainContent() {
    const location = useLocation();
    const [selectedStatus, setSelectedStatus] = useState("");
    const [menuStatus, setMenuStatus] = useState("home");
    const [breadcrumb, setBreadcrumb] = useState("Trang chủ > Dashboard");
    const getBreadcrumb = () => {
        // Check URL-based routes first
        if (location.pathname.startsWith('/main/contract-template')) return "Tài liệu mẫu";
        if (location.pathname.startsWith('/main/contract-type')) return "Cấu hình > Loại tài liệu";
        if (location.pathname.startsWith('/main/org')) return "Quản lý người dùng > Danh sách tổ chức";
        if (location.pathname.startsWith('/main/user-detail')) return "Quản lý người dùng > Chi tiết người dùng";
        if (location.pathname.startsWith('/main/form-user/add')) return "Quản lý người dùng > Thêm người dùng";
        if (location.pathname.startsWith('/main/form-user/edit')) return "Quản lý người dùng > Sửa người dùng";
        if (location.pathname.startsWith('/main/user')) return "Quản lý người dùng > Danh sách người dùng";
        if (location.pathname.startsWith('/main/role')) return "Quản lý người dùng > Danh sách vai trò";
        if (location.pathname.startsWith('/main/document')) return "Tài liệu đã tạo";
        if (location.pathname.startsWith('/main/created-document')) return "Tài liệu đã nhận";
        if (location.pathname.startsWith('/main/server-certificate')) return "Cấu hình > Danh sách chứng thư số Server";
        if (location.pathname.startsWith('/main/c/')) return "Chi tiết hợp đồng";


        // Fallback to state-based logic for old components
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
                    {location.pathname.startsWith('/main/') ? (
                        <Outlet />
                    ) : menuStatus === "home" ? (
                        <DashboardHome />
                    ) : menuStatus === "create-document" ? (
                        <DocumentForm />
                    ) : menuStatus === "document" ? (
                        <Document selectedStatus={selectedStatus} />
                    ) : menuStatus === "tai-lieu-mau" ? (
                        <DocumentTemplates />
                    ) : menuStatus === "user-management" ? (
                        <UserManagement selectedStatus={selectedStatus} />
                    ) : menuStatus === "certificate" ? (
                        <ServerCertificateList />
                    ) : null}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default MainContent;
