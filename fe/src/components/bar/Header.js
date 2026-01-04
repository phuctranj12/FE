import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import notificationService from "../../api/notificationService";
import "../../styles/header.css";

function Header({ breadcrumb }) {
    const navigate = useNavigate();

    const [user, setUser] = useState({ name: "", phone: "" });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNoti, setShowNoti] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const userMenuRef = useRef(null);
    const notiRef = useRef(null);

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

    // Fetch notifications từ API
    const fetchNotifications = async (page = 0) => {
        const token =
            sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;

        try {
            setLoading(true);
            const response = await notificationService.getAllNotice(page, 10);
            console.log("Notifications response:", response);

            if (response.data && response.code === "SUCCESS") {
                const data = response.data;
                const notificationData = data || [];
                console.log("Notifications data:", notificationData);
                setNotifications(notificationData);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load notifications khi component mount
    useEffect(() => {
        const token =
            sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;

        fetchNotifications();
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
            await authService.logout();
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const handleshowUserInfor = () => {
        navigate("/main/user/information");
    };

    // ✅ FIX: Đánh dấu đã đọc và cập nhật state ngay lập tức
    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.readNotice(id);
            // Cập nhật state local ngay để UI phản hồi nhanh
            setNotifications(prevNoti =>
                prevNoti.map(n =>
                    n.id === id ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    };

    // ✅ FIX: Đánh dấu tất cả đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;

            await Promise.all(unreadIds.map(id => notificationService.readNotice(id)));

            setNotifications(prevNoti =>
                prevNoti.map(n => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
        }
    };

    // ✅ FIX: Phân loại notification type dựa trên noticeContent
    const getNotificationType = (notification) => {
        const content = notification.noticeContent || "";
        if (content.includes("Sắp hết hạn") || content.includes("sắp hết hạn")) return "warning";
        if (content.includes("Huỷ") || content.includes("hủy") || content.includes("Hủy")) return "cancel";
        if (content.includes("Quá hạn") || content.includes("quá hạn")) return "expired";
        return "info";
    };

    const getUserInitial = () => {
        const source = (user && (user.name || user.email)) || "";
        const trimmed = source.trim();
        if (!trimmed) return "";
        return trimmed.charAt(0).toUpperCase();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ Đếm số thông báo chưa đọc
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="header">
            <div className="header-left">
                <div
                    className="logo"
                    onClick={() => navigate("/main/dashboard")}
                    style={{ cursor: "pointer" }}
                >
                    <div className="logo-line1">
                        <span className="logo-e">e</span>
                        <span className="logo-contract">Contract</span>
                    </div>
                    <div className="logo-line2">Hợp đồng điện tử</div>
                </div>
                <div className="divider">
                    {(breadcrumb || "Hệ thống quản lý hợp đồng điện tử")
                        .split(">")
                        .map((p, idx, arr) => (
                            <React.Fragment key={idx}>
                                <span
                                    className={`crumb ${idx === arr.length - 1 ? "crumb-current" : ""}`}
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
                        {unreadCount > 0 && (
                            <span className="bell-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNoti && (
                        <div className="dropdown-box noti-dropdown">
                            <div className="noti-header">
                                <h4>Thông báo</h4>
                                <div className="noti-header-actions">
                                    {unreadCount > 0 && (
                                        <>
                                            <span className="unread-count">{unreadCount} chưa đọc</span>
                                            <button
                                                className="mark-all-btn"
                                                onClick={handleMarkAllAsRead}
                                                title="Đánh dấu tất cả đã đọc"
                                            >
                                                ✓ Đọc hết
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="noti-loading">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                                <div className="noti-empty">Không có thông báo mới</div>
                            ) : (
                                <>
                                    <div className="noti-list">
                                        {notifications.map((noti) => (
                                            <div
                                                key={noti.id}
                                                className={`noti-item ${noti.read ? 'read' : 'unread'} ${getNotificationType(noti)}`}
                                                onClick={() => !noti.read && handleMarkAsRead(noti.id)}
                                                style={{ cursor: noti.read ? 'default' : 'pointer' }}
                                            >
                                                <div className="noti-content">
                                                    <div className="noti-title">
                                                        Hợp đồng: {noti.contractNo}
                                                    </div>
                                                    <div className="noti-message">
                                                        {noti.noticeContent}
                                                    </div>
                                                    {noti.email && (
                                                        <div className="noti-sender">
                                                            Email : {noti.email}
                                                        </div>
                                                    )}
                                                    <div className="noti-time">
                                                        Date : {formatDate(noti.createdAt)}
                                                    </div>
                                                </div>
                                                {!noti.read && <span className="unread-dot"></span>}
                                            </div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="noti-pagination">
                                            <button
                                                disabled={currentPage === 0}
                                                onClick={() => fetchNotifications(currentPage - 1)}
                                            >
                                                Trước
                                            </button>
                                            <span>{currentPage + 1} / {totalPages}</span>
                                            <button
                                                disabled={currentPage >= totalPages - 1}
                                                onClick={() => fetchNotifications(currentPage + 1)}
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
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
                        <div className="avatar">{getUserInitial()}</div>
                        <div className="user-text">
                            <span className="name">{user.name || "Tên người dùng"}</span>
                            {user.phone && <span className="phone">{user.phone}</span>}
                        </div>
                    </div>

                    {showUserMenu && (
                        <div className="dropdown-box user-menu">
                            <div className="menu-item" onClick={handleshowUserInfor}>
                                Thông tin tài khoản
                            </div>
                            <div className="menu-item">Đổi mật khẩu</div>
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