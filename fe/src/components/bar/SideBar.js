import React, { useState } from "react";
import "../../styles/sideBar.css";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const CREATED_MENU_ITEMS = [
    { status: 0, slug: "draft", label: "Bản nháp" },
    { status: 20, slug: "processing", label: "Đang xử lý" },
    { status: 30, slug: "signed", label: "Hoàn thành" },
    { status: 31, slug: "rejected", label: "Từ chối" },
    { status: 32, slug: "cancel", label: "Hủy bỏ" },
    { status: 1, slug: "about-expire", label: "Sắp hết hạn" },
    { status: 2, slug: "expire", label: "Hết hạn" },
];

function Sidebar({ setSelectedStatus, selectedStatus, setMenuStatus, menuStatus }) {
    const [activeMenu, setActiveMenu] = useState(null); // menu đang mở dropdown
    const [activeParent, setActiveParent] = useState(null); // menu cấp 1 đang active
    const [activeSub, setActiveSub] = useState(null); // submenu đang active

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    /** Khi click menu cấp 1 => chỉ toggle, không active */
    const toggleMenu = (menuName) => {
        setActiveMenu(prev => prev === menuName ? null : menuName);
    };

    /** Click submenu => active parent + active sub */
    const handleActiveSubMenu = (parentKey, subKey) => {
        setActiveParent(parentKey);
        setActiveSub(subKey);
    };

    return (
        <aside className="sidebar">
            <Button
                outlineColor="#0B57D0"
                backgroundColor="rgb(11, 87, 208)"
                text="Tạo ngay"
                onClick={() => handleNavigation('/main/form-contract/add')}
            />

            <div className="menu">

                {/* Trang chủ */}
                <div
                    className={`menu-item ${activeParent === "home" ? "active-menu" : ""}`}
                    onClick={() => {
                        setActiveParent("home");
                        setActiveSub(null);
                        handleNavigation('/main/dashboard');
                    }}
                >
                    Trang chủ
                </div>

                {/* ================= TÀI LIỆU ĐÃ TẠO ================= */}
                <div
                    className={`menu-item ${activeParent === "document" ? "active-menu" : ""}`}
                    onClick={() => toggleMenu("tao")}
                >
                    Tài liệu đã tạo{" "}
                    <i className={`lni ${activeMenu === "tao" ? "lni-chevron-down" : "lni-chevron-right"}`}></i>
                </div>

                {activeMenu === "tao" && (
                    <div className="submenu">
                        {CREATED_MENU_ITEMS.map((item) => (
                            <div
                                key={item.status}
                                className={`subitem ${activeSub === item.slug ? "active-sub" : ""}`}
                                onClick={() => {
                                    handleActiveSubMenu("document", item.slug);
                                    handleNavigation(`/main/contract/create/${item.slug}`);
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* ================= TÀI LIỆU ĐÃ NHẬN ================= */}
                <div
                    className={`menu-item ${activeParent === "nhan" ? "active-menu" : ""}`}
                    onClick={() => toggleMenu("nhan")}
                >
                    Tài liệu đã nhận
                    <i className={`lni ${activeMenu === "nhan" ? "lni-chevron-down" : "lni-chevron-right"}`}></i>
                </div>

                {activeMenu === "nhan" && (
                    <div className="submenu">
                        <div
                            className={`subitem ${activeSub === "wait-processing" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("nhan", "wait-processing");
                                handleNavigation('/main/contract/receive/wait-processing');
                            }}>
                            Chờ xử lý
                        </div>
                        <div
                            className={`subitem ${activeSub === "processed" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("nhan", "processed");
                                handleNavigation('/main/contract/receive/processed');
                            }}>
                            Đã xử lý
                        </div>
                        <div
                            className={`subitem ${activeSub === "shared" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("nhan", "shared");
                                handleNavigation('/main/contract/receive/shared');
                            }}>
                            Được chia sẻ
                        </div>
                    </div>
                )}

                {/* ================= TÀI LIỆU MẪU ================= */}
                <div
                    className={`menu-item ${activeParent === "template" ? "active-menu" : ""}`}
                    onClick={() => {
                        handleActiveSubMenu("template", null);
                        handleNavigation('/main/contract-template');
                    }}>
                    Tài liệu mẫu
                </div>

                {/* ================= QUẢN LÝ NGƯỜI DÙNG ================= */}
                <div
                    className={`menu-item ${activeParent === "user" ? "active-menu" : ""}`}
                    onClick={() => toggleMenu("nguoidung")}
                >
                    Quản lý người dùng
                    <i
                        className={`lni ${activeMenu === "nguoidung" ? "lni-chevron-down" : "lni-chevron-right"}`}
                    ></i>
                </div>

                {activeMenu === "nguoidung" && (
                    <div className="submenu">
                        <div
                            className={`subitem ${activeSub === "org" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("user", "org");
                                handleNavigation("/main/org");
                            }}>
                            Tổ chức
                        </div>

                        <div
                            className={`subitem ${activeSub === "user-list" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("user", "user-list");
                                handleNavigation("/main/user");
                            }}>
                            Người dùng
                        </div>

                        <div
                            className={`subitem ${activeSub === "role" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("user", "role");
                                handleNavigation("/main/role");
                            }}>
                            Vai trò
                        </div>
                    </div>
                )}

                {/* ================= CẤU HÌNH ================= */}
                <div
                    className={`menu-item ${activeParent === "config" ? "active-menu" : ""}`}
                    onClick={() => toggleMenu("cauhinh")}
                >
                    Cấu hình
                    <i className={`lni ${activeMenu === "cauhinh" ? "lni-chevron-down" : "lni-chevron-right"}`}></i>
                </div>

                {activeMenu === "cauhinh" && (
                    <div className="submenu">
                        <div
                            className={`subitem ${activeSub === "contract-type" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("config", "contract-type");
                                handleNavigation("/main/contract-type");
                            }}>
                            Loại tài liệu
                        </div>

                        <div
                            className={`subitem ${activeSub === "server-cert" ? "active-sub" : ""}`}
                            onClick={() => {
                                handleActiveSubMenu("config", "server-cert");
                                handleNavigation("/main/server-certificate");
                            }}>
                            Danh sách chứng thư số Server
                        </div>
                    </div>
                )}

                {/* ================= BÁO CÁO ================= */}
                <div
                    className={`menu-item ${activeParent === "report" ? "active-menu" : ""}`}
                    onClick={() => toggleMenu("baocao")}
                >
                    Báo cáo
                    <i className={`lni ${activeMenu === "baocao" ? "lni-chevron-down" : "lni-chevron-right"}`}></i>
                </div>

                {activeMenu === "baocao" && (
                    <div className="submenu">
                        <div
                            className={`subitem ${activeSub === "chi-tiet" ? "active-sub" : ""}`}
                            onClick={() => handleActiveSubMenu("report", "chi-tiet")}>
                            Chi tiết
                        </div>

                        <div
                            className={`subitem ${activeSub === "trang-thai-xu-ly" ? "active-sub" : ""}`}
                            onClick={() => handleActiveSubMenu("report", "trang-thai-xu-ly")}>
                            Trạng thái xử lý
                        </div>

                        <div
                            className={`subitem ${activeSub === "sl-theo-trang-thai" ? "active-sub" : ""}`}
                            onClick={() => handleActiveSubMenu("report", "sl-theo-trang-thai")}>
                            SL theo trạng thái
                        </div>

                        <div
                            className={`subitem ${activeSub === "sl-theo-loai" ? "active-sub" : ""}`}
                            onClick={() => handleActiveSubMenu("report", "sl-theo-loai")}>
                            SL theo loại tài liệu
                        </div>

                        <div
                            className={`subitem ${activeSub === "tai-lieu-nhan" ? "active-sub" : ""}`}
                            onClick={() => handleActiveSubMenu("report", "tai-lieu-nhan")}>
                            Tài liệu đã nhận
                        </div>
                    </div>
                )}

                {/* ================= KIỂM TRA CHỮ KÝ ================= */}
                <div
                    className={`menu-item ${activeParent === "check-sign" ? "active-menu" : ""}`}
                    onClick={() => {
                        handleActiveSubMenu("check-sign", null);
                        handleNavigation('/main/check-sign-digital');
                    }}
                >
                    Kiểm tra chữ ký số
                </div>

            </div>
        </aside>
    );
}

export default Sidebar;
