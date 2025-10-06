import React, { useState } from "react";
import "../../styles/sideBar.css";

function Sidebar({ setSelectedStatus, selectedStatus }) {
    const [activeMenu, setActiveMenu] = useState(null);

    const toggleMenu = (menuName) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    };
    // ✅ Khi click submenu thì đổi trạng thái tài liệu
    const handleSelect = (status) => {
        setSelectedStatus(status);
    };
    return (
        <aside className="sidebar">
            <button className="create-btn">+ Tạo ngay</button>

            <div className="menu">
                {/* Trang chủ */}
                <div className="menu-item" onClick={() => handleSelect("home")}>
                    🏠 Trang chủ
                </div>

                {/* Tài liệu đã tạo */}
                <div className="menu-item" onClick={() => toggleMenu("tao")}>
                    📄 Tài liệu đã tạo{" "}
                    <i
                        className={`lni ${activeMenu === "tao" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "tao" && (
                    <div className="submenu">
                        <div onClick={() => handleSelect("ban-nhap")}>Bản nháp</div>
                        <div onClick={() => handleSelect("dang-xu-ly")}>Đang xử lý</div>
                        <div onClick={() => handleSelect("sap-het-han")}>Sắp hết hạn</div>
                        <div onClick={() => handleSelect("qua-han")}>Quá hạn</div>
                        <div onClick={() => handleSelect("tu-choi")}>Từ chối</div>
                        <div onClick={() => handleSelect("huy-bo")}>Hủy bỏ</div>
                        <div onClick={() => handleSelect("hoan-thanh")}>Hoàn thành</div>
                        <div onClick={() => handleSelect("thanh-ly")}>Thanh lý</div>
                    </div>
                )}

                {/* Tài liệu đã nhận */}
                <div className="menu-item" onClick={() => toggleMenu("nhan")}>
                    📥 Tài liệu đã nhận{" "}
                    <i
                        className={`lni ${activeMenu === "nhan" ? "lni-chevron-down" : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "nhan" && (
                    <div className="submenu">
                        <div onClick={() => handleSelect("cho-xu-ly")}>Chờ xử lý</div>
                        <div onClick={() => handleSelect("da-xu-ly")}>Đã xử lý</div>
                        <div onClick={() => handleSelect("duoc-chia-se")}>Được chia sẻ</div>
                    </div>
                )}

                {/* Tài liệu mẫu */}
                <div className="menu-item" onClick={() => handleSelect("tai-lieu-mau")}>
                    📄 Tài liệu mẫu
                </div>

                {/* Quản lý người dùng */}
                <div className="menu-item" onClick={() => toggleMenu("nguoidung")}>
                    👤 Quản lý người dùng{" "}
                    <i
                        className={`lni ${activeMenu === "nguoidung"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "nguoidung" && (
                    <div className="submenu">
                        <div onClick={() => handleSelect("to-chuc")}>Tổ chức</div>
                        <div onClick={() => handleSelect("nguoi-dung")}>Người dùng</div>
                        <div onClick={() => handleSelect("vai-tro")}>Vai trò</div>
                    </div>
                )}

                {/* Cấu hình */}
                <div className="menu-item" onClick={() => toggleMenu("cauhinh")}>
                    ⚙️ Cấu hình{" "}
                    <i
                        className={`lni ${activeMenu === "cauhinh"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "cauhinh" && (
                    <div className="submenu">
                        <div onClick={() => handleSelect("loai-tai-lieu")}>Loại tài liệu</div>
                        <div onClick={() => handleSelect("gui-sms-email")}>
                            Cấu hình gửi SMS/Email
                        </div>
                        <div onClick={() => handleSelect("chung-thu-so")}>
                            Danh sách chứng thư số Server
                        </div>
                        <div onClick={() => handleSelect("webhook")}>Cấu hình WebHook</div>
                    </div>
                )}

                {/* Báo cáo */}
                <div className="menu-item" onClick={() => toggleMenu("baocao")}>
                    📊 Báo cáo{" "}
                    <i
                        className={`lni ${activeMenu === "baocao"
                            ? "lni-chevron-down"
                            : "lni-chevron-right"
                            }`}
                    ></i>
                </div>
                {activeMenu === "baocao" && (
                    <div className="submenu">
                        <div onClick={() => handleSelect("chi-tiet")}>Chi tiết</div>
                        <div onClick={() => handleSelect("sap-het-hieu-luc")}>
                            Sắp hết hiệu lực
                        </div>
                        <div onClick={() => handleSelect("trang-thai-xu-ly")}>
                            Trạng thái xử lý
                        </div>
                        <div onClick={() => handleSelect("sl-theo-trang-thai")}>
                            SL theo trạng thái
                        </div>
                        <div onClick={() => handleSelect("sl-theo-loai")}>
                            SL theo loại tài liệu
                        </div>
                        <div onClick={() => handleSelect("tai-lieu-nhan")}>
                            Tài liệu đã nhận
                        </div>
                        <div onClick={() => handleSelect("lich-su-sms")}>Lịch sử gửi SMS</div>
                        <div onClick={() => handleSelect("lich-su-email")}>
                            Lịch sử gửi Email
                        </div>
                        <div onClick={() => handleSelect("xac-thuc-ekyc")}>
                            Báo cáo xác thực eKYC
                        </div>
                    </div>
                )}

                {/* Kiểm tra chữ ký số */}
                <div className="menu-item" onClick={() => handleSelect("kiem-tra-chu-ky-so")}>
                    🔍 Kiểm tra chữ ký số
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
