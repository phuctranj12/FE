import { useState, useRef, useEffect } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../../styles/actionMenu.css";

function ActionMenu({
    onEdit,
    onViewFlow,
    onCopy,
    onDelete,
    onShare,
    onExtend,
    onUploadAttachment,
    onViewRelated,
    doc
}) {
    const [open, setOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = () => {
        setShowConfirm(true);
        setOpen(false);
    };

    const handleConfirmDelete = () => {
        if (onDelete && doc?.id) onDelete(doc.id);
        setShowConfirm(false);
    };

    const handleMenuAction = (action) => {
        setOpen(false);
        if (action && doc) {
            action(doc);
        }
    };

    // Kiểm tra trạng thái để hiển thị menu phù hợp
    const canEdit = [0, 10].includes(doc?.status); // Nháp, Đã tạo
    const canShare = doc?.status === 30; // Hoàn thành
    const canExtend = ![32, 31].includes(doc?.status); // Không phải Hủy bỏ, Từ chối
    const canUploadAttachment = ![32, 31].includes(doc?.status);

    return (
        <div className="action-menu" ref={menuRef}>
            <button className="dots-btn" onClick={toggleMenu}>
                ⋮
            </button>

            {open && (
                <div className="action-dropdown">
                    {canEdit && (
                        <button onClick={() => handleMenuAction(onEdit)}>
                            <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg> Sửa tài liệu
                        </button>
                    )}

                    <button onClick={() => handleMenuAction(onViewFlow)}>
                        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a7.5 7.5 0 0 1-14.8 0M4.6 9a7.5 7.5 0 0 1 14.8 0"></path>
                        </svg> Xem luồng ký
                    </button>

                    <button onClick={() => handleMenuAction(onViewRelated)}>
                        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.07 0l3.53-3.53a5 5 0 1 0-7.07-7.07L12 4"></path>
                            <path d="M14 11a5 5 0 0 1-7.07 0L3.4 7.47a5 5 0 1 1 7.07-7.07L10 4"></path>
                        </svg>
                        Xem tài liệu liên quan
                    </button>

                    {canUploadAttachment && (
                        <button onClick={() => handleMenuAction(onUploadAttachment)}>
                            <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15V8a5 5 0 0 0-10 0v10a3 3 0 0 0 6 0V9"></path>
                            </svg>
                            Tải lên đính kèm
                        </button>
                    )}

                    {canExtend && (
                        <button onClick={() => handleMenuAction(onExtend)}>
                            <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Gia hạn hợp đồng
                        </button>
                    )}

                    {canShare && (
                        <button onClick={() => handleMenuAction(onShare)}>
                            <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5"></path>
                                <polyline points="16 6 12 2 8 6"></polyline>
                                <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            Chia sẻ hợp đồng
                        </button>
                    )}

                    <button onClick={() => handleMenuAction(onCopy)}>
                        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Sao chép tài liệu
                    </button>

                    <div className="menu-divider"></div>

                    <button className="delete-btn" onClick={handleDelete}>
                        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Xóa tài liệu
                    </button>
                </div>
            )}

            <ConfirmDeleteModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                documentName={doc?.name || "này"}
            />
        </div>
    );
}

export default ActionMenu;