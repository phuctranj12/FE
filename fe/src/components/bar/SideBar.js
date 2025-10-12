import React, { useState } from "react";
import "../../styles/sideBar.css";
import { useNavigate } from "react-router-dom";

function Sidebar({ setSelectedStatus, selectedStatus, setMenuStatus, menuStatus }) {
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
            <button className="create-btn" onClick={() => handleNavigation("/login")}>Tạo ngay</button>

            <div className="menu">
                {/* Trang chủ */}
                <div className="menu-item" onClick={() => {
                    handleSelectMenu("home");
                    toggleMenu(null);
                }} >
                    Trang chủ
                </div>

                {/* Tài liệu đã tạo */}
                <div className={`menu-item${(menuStatus === "document") ? " active-menu" : ""}`} onClick={() => {
                    toggleMenu("tao");
                    handleSelectMenu("document");
                    handleSelect("all")
                }} >
                    Tài liệu đã tạo{" "}
                    <i
                        className={`lni ${activeMenu === "tao" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "tao" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => handleSelect("ban-nhap")}>Bản nháp</div>
                        <div className="subitem" onClick={() => handleSelect("dang-xu-ly")}>Đang xử lý</div>
                        <div className="subitem" onClick={() => handleSelect("sap-het-han")}>Sắp hết hạn</div>
                        <div className="subitem" onClick={() => handleSelect("qua-han")}>Quá hạn</div>
                        <div className="subitem" onClick={() => handleSelect("tu-choi")}>Từ chối</div>
                        <div className="subitem" onClick={() => handleSelect("huy-bo")}>Hủy bỏ</div>
                        <div className="subitem" onClick={() => handleSelect("hoan-thanh")}>Hoàn thành</div>
                        <div className="subitem" onClick={() => handleSelect("thanh-ly")}>Thanh lý</div>
                    </div>
                )}

                {/* Tài liệu đã nhận */}
                <div className="menu-item" onClick={() => toggleMenu("nhan")}>
                    Tài liệu đã nhận{" "}
                    <i
                        className={`lni ${activeMenu === "nhan" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "nhan" && (
                    <div className="submenu">
                        <div className="subitem" onClick={() => handleSelect("cho-xu-ly")}>Chờ xử lý</div>
                        <div className="subitem" onClick={() => handleSelect("da-xu-ly")}>Đã xử lý</div>
                        <div className="subitem" onClick={() => handleSelect("duoc-chia-se")}>Được chia sẻ</div>
                    </div>
                )}

                {/* Tài liệu mẫu */}
                <div className="menu-item" onClick={() => {
                    handleSelectMenu("tai-lieu-mau");
                    toggleMenu(null);
                }}>
                    Tài liệu mẫu
                </div>

                {/* Quản lý người dùng */}
                <div className="menu-item" onClick={() => toggleMenu("nguoidung")}>
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
                        <div className="subitem" onClick={() => handleSelect("to-chuc")}>Tổ chức</div>
                        <div className="subitem" onClick={() => handleSelect("nguoi-dung")}>Người dùng</div>
                        <div className="subitem" onClick={() => handleSelect("vai-tro")}>Vai trò</div>
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
                        <div className="subitem" onClick={() => handleSelect("loai-tai-lieu")}>Loại tài liệu</div>
                        <div className="subitem" onClick={() => handleSelect("gui-sms-email")}>
                            Cấu hình gửi SMS/Email
                        </div>
                        <div className="subitem" onClick={() => handleSelect("chung-thu-so")}>
                            Danh sách chứng thư số Server
                        </div>
                        <div className="subitem" onClick={() => handleSelect("webhook")}>Cấu hình WebHook</div>
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
