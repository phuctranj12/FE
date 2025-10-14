import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Thêm dòng này
import "../../styles/header.css";
// Logo is loaded from remote URL
function Header({ breadcrumb }) {
    const navigate = useNavigate(); // Thêm dòng này
    // Dữ liệu người dùng sample
    const [user, setUser] = useState({
        name: "Trần Tuấn Phúc",
        phone: "0782413245",
    });

    // Trạng thái hiển thị menu 
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNoti, setShowNoti] = useState(false);

    const userMenuRef = useRef(null);
    const notiRef = useRef(null);

    // Dữ liệu thông báo sample 
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

    // Đóng dropdown khi click ra ngoài 
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

    return (
        <header className="header">
            {/* --- Bên trái --- */}
            <div className="header-left">
                <img alt="Logo" className="logo" src="https://econtractdev.mobifone.ai/images/logo_web.png" />
                <div className="divider">
                    {(() => {
                        const text = breadcrumb || "Hệ thống quản lý hợp đồng điện tử";
                        const parts = text.split('>').map(p => p.trim());
                        return (
                            <div className="breadcrumb-inline">
                                {parts.map((p, idx) => (
                                    <React.Fragment key={idx}>
                                        <span className={`crumb ${idx === parts.length - 1 ? 'crumb-current' : ''}`}>{p}</span>
                                        {idx < parts.length - 1 && (
                                            <svg className="chev" viewBox="0 0 8 12" aria-hidden="true">
                                                <path d="M2 1l4 5-4 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                    })()}
                </div>

            </div>

            {/* Bên phải */}
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
                            <div className="noti-header">
                                <span>DANH SÁCH THÔNG BÁO</span>
                                <button
                                    className="read-all-btn"
                                    onClick={() => setNotifications([])}
                                >
                                    ĐỌC TẤT CẢ
                                </button>
                            </div>

                            <div className="noti-list">
                                {notifications.map((n) => (
                                    <div key={n.id} className="noti-item">
                                        <div className="noti-title">{n.title}</div>
                                        <div className="noti-sender">Bên A: {n.sender}</div>
                                        <div className="noti-footer">
                                            <span className="noti-time">{n.time}</span>
                                            <span
                                                className={`noti-status ${n.type === "warning"
                                                    ? "status-warning"
                                                    : n.type === "cancel"
                                                        ? "status-cancel"
                                                        : "status-expired"
                                                    }`}
                                            >
                                                {n.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="noti-footer-btn">
                                <button className="view-all-btn">Xem tất cả</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Thông tin người dùng --- */}
                <div className="user-wrapper" ref={userMenuRef}>
                    <div
                        className="user-info"
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNoti(false);
                        }}
                    >
                        <div className="avatar"></div>
                        <div className="user-text">
                            <span className="name">{user.name}</span>
                            <span className="phone">{user.phone}</span>
                        </div>
                    </div>

                    {showUserMenu && (
                        <div className="dropdown-box user-menu">
                            <div className="menu-item">Thông tin tài khoản</div>
                            <div className="menu-item">Đổi mật khẩu</div>
                            <div className="menu-item">Plugin ký Token</div>
                            <div className="menu-item logout" onClick={() => navigate("/login")}>Đăng xuất</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
// ...existing code...