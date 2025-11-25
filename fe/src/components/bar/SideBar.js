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

function Sidebar({ setSelectedStatus, selectedStatus, setMenuStatus, menuStatus, setBreadcrumb }) {
    const [activeMenu, setActiveMenu] = useState(null);
    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path);
    }
    const toggleMenu = (menuName) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);

    };

    // Khi click submenu thì đổi trạng thái tài liệu
    const handleSelect = (status) => {
        setSelectedStatus(status);
    };
    const handleSelectMenu = (menu) => {
        setMenuStatus(menu);
    }
    return (
        <aside className="sidebar">
            {/* <button className="create-btn" onClick={() => handleSelectMenu("create-document")}>Tạo ngay</button> */}
            <Button
                outlineColor="#0B57D0"
                backgroundColor="rgb(11, 87, 208)"
                text="Tạo ngay"
                onClick={() => handleNavigation('/main/form-contract/add')}
            />
            <div className="menu">
                {/* Trang chủ */}
                <div className="menu-item" onClick={() => {
                    handleSelectMenu("home");
                    toggleMenu(null);
                    handleNavigation('/main/dashboard');
                }} >
                    Trang chủ
                </div>

                {/* Tài liệu đã tạo */}
                <div className={`menu-item${(menuStatus === "document") ? " active-menu" : ""}`} onClick={() => {
                    toggleMenu("tao");
                    handleSelectMenu("document");
                }} >
                    Tài liệu đã tạo{" "}
                    <i
                        className={`lni ${activeMenu === "tao" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "tao" && (
                    <div className="submenu">
                        {CREATED_MENU_ITEMS.map((item) => (
                            <div
                                key={item.status}
                                className="subitem"
                                onClick={() => {
                                    handleSelect(item.status);
                                    handleNavigation(`/main/contract/create/${item.slug}`);
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Tài liệu đã nhận */}
                <div className="menu-item" onClick={() => {
                    toggleMenu("nhan");
                }}>
                    Tài liệu đã nhận{" "}
                    <i
                        className={`lni ${activeMenu === "nhan" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "nhan" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => {
                            handleSelect("cho-xu-ly");
                            handleNavigation('/main/contract/receive/wait-processing');
                        }}>Chờ xử lý</div>
                        <div className="subitem" onClick={() => {
                            handleSelect("da-xu-ly");
                            handleNavigation('/main/contract/receive/processed');
                        }}>Đã xử lý</div>
                        <div className="subitem" onClick={() => {
                            handleSelect("duoc-chia-se");
                            handleNavigation('/main/contract/receive/shared');
                        }}>Được chia sẻ</div>
                    </div>
                )}

                {/* Tài liệu mẫu */}
                <div className={`menu-item${(menuStatus === "tai-lieu-mau") ? " active-menu" : ""}`} onClick={() => {
                    handleSelectMenu("tai-lieu-mau");
                    toggleMenu(null);
                    handleNavigation('/main/contract-template');
                }}>
                    Tài liệu mẫu
                </div>

                {/* Quản lý người dùng */}
                <div className={`menu-item${(menuStatus === "user-management") ? " active-menu" : ""}`} onClick={() => {
                    toggleMenu("nguoidung");
                    handleSelectMenu("user-management");
                }}>
                    Quản lý người dùng{" "}
                    <i
                        className={`lni ${activeMenu === "nguoidung"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "nguoidung" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => handleNavigation("/main/org")}>Tổ chức</div>
                        <div className="subitem" onClick={() => handleNavigation("/main/user")}>Người dùng</div>
                        <div className="subitem" onClick={() => handleNavigation("/main/role")}>Vai trò</div>
                    </div>
                )}

                {/* Cấu hình */}
                <div className="menu-item" onClick={() => toggleMenu("cauhinh")}>
                    Cấu hình{" "}
                    <i
                        className={`lni ${activeMenu === "cauhinh"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "cauhinh" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => handleNavigation("/main/contract-type")}>Loại tài liệu</div>

                        <div className="subitem" onClick={() => {
                            handleSelectMenu("certificate");
                            handleNavigation("/main/server-certificate");
                        }}>
                            Danh sách chứng thư số Server
                        </div>
                    </div>
                )}

                {/* Báo cáo */}
                <div className="menu-item" onClick={() => toggleMenu("baocao")}>
                    Báo cáo{" "}
                    <i
                        className={`lni ${activeMenu === "baocao"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "baocao" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => handleSelect("chi-tiet")}>Chi tiết</div>
                        <div className="subitem" onClick={() => handleSelect("sap-het-hieu-luc")}>
                            Sắp hết hiệu lực
                        </div>
                        <div className="subitem" onClick={() => handleSelect("trang-thai-xu-ly")}>
                            Trạng thái xử lý
                        </div>
                        <div className="subitem" onClick={() => handleSelect("sl-theo-trang-thai")}>
                            SL theo trạng thái
                        </div>
                        <div className="subitem" onClick={() => handleSelect("sl-theo-loai")}>
                            SL theo loại tài liệu
                        </div>
                        <div className="subitem" onClick={() => handleSelect("tai-lieu-nhan")}>
                            Tài liệu đã nhận
                        </div>
                        <div className="subitem" onClick={() => handleSelect("lich-su-sms")}>Lịch sử gửi SMS</div>
                        <div className="subitem" onClick={() => handleSelect("lich-su-email")}>
                            Lịch sử gửi Email
                        </div>
                        <div className="subitem" onClick={() => handleSelect("xac-thuc-ekyc")}>
                            Báo cáo xác thực eKYC
                        </div>
                    </div>
                )}

                {/* Kiểm tra chữ ký số */}
                <div className="menu-item" onClick={() => {
                    handleSelectMenu("kiem-tra-chu-ky-so");
                    toggleMenu(null);
                }
                }>
                    Kiểm tra chữ ký số
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
