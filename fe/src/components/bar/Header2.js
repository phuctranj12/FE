import React, { useState, useRef, useEffect } from "react";
import "../../styles/header.css";

function Header({
    userProp,            // (tuỳ chọn) truyền vào từ cha khi có dữ liệu backend
    onLogout,            // (tuỳ chọn) callback logout
    onOpenProfile,       // (tuỳ chọn) callback mở profile
    onChangePassword,    // (tuỳ chọn) callback đổi mật khẩu
    onPluginToken,       // (tuỳ chọn) callback plugin token
}) {
    // dùng userProp nếu được truyền, nếu không dùng giá trị mặc định (sample)
    const [user, setUser] = useState(
        userProp || { name: "Nguyễn Quang Minh", phone: "0357631601", lang: "VI" }
    );

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);

    const userRef = useRef(null);
    const notiRef = useRef(null);

    // sample notifications (mảng dữ liệu bạn có thể đổi / map từ backend)
    const sampleNotifications = [
        {
            id: 1,
            title: "[Sắp hết hạn] TL CHECK RS MINH 001",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "06/10/2025 09:00",
            status: "Sắp hết hạn",
            statusClass: "status-warning",
        },
        {
            id: 2,
            title: "[Hủy] OS Lab",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "03/10/2025 11:28",
            status: "Hủy bỏ",
            statusClass: "status-cancel",
        },
        {
            id: 3,
            title: "[Quá hạn] TL CHECK NGOẠI HỆ THỐNG SDT MBF",
            sender: "Trung tâm công nghệ thông tin MobiFone",
            time: "25/09/2025 09:01",
            status: "Quá hạn",
            statusClass: "status-expired",
        },
    ];

    // đóng dropdown khi click ra ngoài (cả 2 dropdown)
    useEffect(() => {
        function handleClickOutside(e) {
            if (userRef.current && !userRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (notiRef.current && !notiRef.current.contains(e.target)) {
                setNotiOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setUserMenuOpen(false);
        if (typeof onLogout === "function") onLogout();
        else {
            // sample fallback
            alert("Đăng xuất (sample) — hãy implement onLogout prop để gọi backend");
        }
    };

    const handleOpenProfile = () => {
        setUserMenuOpen(false);
        if (typeof onOpenProfile === "function") onOpenProfile();
        else alert("Mở thông tin tài khoản (sample)");
    };

    const handleChangePassword = () => {
        setUserMenuOpen(false);
        if (typeof onChangePassword === "function") onChangePassword();
        else alert("Đổi mật khẩu (sample)");
    };

    const handlePluginToken = () => {
        setUserMenuOpen(false);
        if (typeof onPluginToken === "function") onPluginToken();
        else alert("Plugin ký Token (sample)");
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src="/logo.png" alt="Logo" className="logo" />
                <span className="header-title">HỆ THỐNG QUẢN LÝ HỢP ĐỒNG ĐIỆN TỬ</span>
            </div>

            <div className="header-right">
                <button className="lang-btn">{user.lang} ▾</button>

                <div className="noti-wrapper" ref={notiRef}>
                    <button
                        className="bell-btn"
                        onClick={() => {
                            setNotiOpen((s) => !s);
                            setUserMenuOpen(false); // đóng user menu nếu đang mở
                        }}
                        aria-expanded={notiOpen}
                    >
                        🔔
                        <span className="bell-badge">2</span>
                    </button>

                    {notiOpen && (
                        <div className="noti-dropdown">
                            <div className="noti-header">
                                <strong>Danh sách thông báo</strong>
                                <button className="read-all">Đọc tất cả</button>
                            </div>

                            <div className="noti-list">
                                {sampleNotifications.map((n) => (
                                    <div key={n.id} className="noti-item">
                                        <div className="noti-title">{n.title}</div>
                                        <div className="noti-sender">Bên A: {n.sender}</div>
                                        <div className="noti-meta">
                                            <span className="noti-time">{n.time}</span>
                                            <span className={`noti-status ${n.statusClass}`}>
                                                {n.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="noti-footer">
                                <button className="view-all">Xem tất cả</button>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="user-area"
                    ref={userRef}
                    onClick={() => {
                        setUserMenuOpen((s) => !s);
                        setNotiOpen(false); // đóng noti dropdown nếu đang mở
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <img src="/avatar.png" alt="avatar" className="avatar" />
                    <div className="user-text">
                        <div className="user-name">{user.name}</div>
                        <div className="user-phone">{user.phone}</div>
                    </div>
                    <span className={`caret ${userMenuOpen ? "open" : ""}`}>▾</span>

                    {userMenuOpen && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-item" onClick={handleOpenProfile}>
                                👤 Thông tin tài khoản
                            </div>
                            <div
                                className="user-dropdown-item"
                                onClick={handleChangePassword}
                            >
                                🔒 Đổi mật khẩu
                            </div>
                            <div className="user-dropdown-item" onClick={handlePluginToken}>
                                🔌 Plugin ký Token
                            </div>
                            <div className="user-dropdown-item logout" onClick={handleLogout}>
                                🚪 Đăng xuất
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
