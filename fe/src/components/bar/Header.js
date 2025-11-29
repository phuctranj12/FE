import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService"; // giả sử authService có hàm logout
import "../../styles/header.css";

function Header({ breadcrumb }) {
    const navigate = useNavigate();

    const [user, setUser] = useState({ name: "", phone: "" });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNoti, setShowNoti] = useState(false);

    const userMenuRef = useRef(null);
    const notiRef = useRef(null);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "[Sắp hết hạn] TL CHECK RS MINH 001",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "04/10/2025 09:00",
            status: "Sắp hết hạn",
            type: "warning",
        },
        {
            id: 2,
            title: "[Huỷ] OS Lab",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "03/10/2025 11:28",
            status: "Huỷ bỏ",
            type: "cancel",
        },
        {
            id: 3,
            title: "[Quá hạn] TL CHECK NGOẠI HỆ THỐNG SDT MBF",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "25/09/2025 09:01",
            status: "Quá hạn",
            type: "expired",
        },
    ]);

    // Load user từ localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Không parse được user từ localStorage", e);
            }
        }
    }, []);

    // Click ra ngoài đóng dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target) &&
                notiRef.current &&
                !notiRef.current.contains(e.target)
            ) {
                setShowUserMenu(false);
                setShowNoti(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Hàm logout
    const handleLogout = async () => {
        try {
            // Gọi API logout (nếu cần gửi token thì lấy từ user/token)
            await authService.logout();
            // Xóa user khỏi localStorage
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            // Vẫn xóa user và redirect nếu API lỗi
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const getUserInitial = () => {
        const source = (user && (user.name || user.email)) || "";
        const trimmed = source.trim();
        if (!trimmed) return "";
        return trimmed.charAt(0).toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <img
                    alt="Logo"
                    className="logo"
                    src="https://www.chemetal.com/wp-content/uploads/press-logo-contract.png"
                    onClick={() => navigate("/main/dashboard")}
                    style={{ cursor: "pointer" }}
                />
                <div className="divider">
                    {(breadcrumb || "Hệ thống quản lý hợp đồng điện tử")
                        .split(">")
                        .map((p, idx, arr) => (
                            <React.Fragment key={idx}>
                                <span
                                    className={`crumb ${idx === arr.length - 1 ? "crumb-current" : ""
                                        }`}
                                    onClick={() => idx === 0 && navigate("/main/dashboard")}
                                    style={idx === 0 ? { cursor: "pointer" } : undefined}
                                >
                                    {p.trim()}
                                </span>
                                {idx < arr.length - 1 && (
                                    <svg className="chev" viewBox="0 0 8 12" aria-hidden="true">
                                        <path
                                            d="M2 1l4 5-4 5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </React.Fragment>
                        ))}
                </div>
            </div>

            <div className="header-right">
                {/* Chuông thông báo */}
                <div className="bell-wrapper" ref={notiRef}>
                    <button
                        className="bell-btn"
                        onClick={() => {
                            setShowNoti(!showNoti);
                            setShowUserMenu(false);
                        }}
                    >
                        🔔
                        {notifications.length > 0 && (
                            <span className="bell-badge">{notifications.length}</span>
                        )}
                    </button>

                    {showNoti && (
                        <div className="dropdown-box noti-dropdown">
                            {/* ...notifications list... */}
                        </div>
                    )}
                </div>

                {/* User info */}
                <div className="user-wrapper" ref={userMenuRef}>
                    <div
                        className="user-info"
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNoti(false);
                        }}
                    >
                        <div className="avatar">
                            {getUserInitial()}
                        </div>
                        <div className="user-text">
                            <span className="name">{user.name || "Tên người dùng"}</span>
                            {user.phone && <span className="phone">{user.phone}</span>}
                        </div>
                    </div>

                    {showUserMenu && (
                        <div className="dropdown-box user-menu">
                            <div className="menu-item">Thông tin tài khoản</div>
                            <div className="menu-item">Đổi mật khẩu</div>
                            <div className="menu-item">Plugin ký Token</div>
                            <div className="menu-item logout" onClick={handleLogout}>
                                Đăng xuất
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
