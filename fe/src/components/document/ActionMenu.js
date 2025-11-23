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
                            <span className="menu-icon">✏️</span> Sửa tài liệu
                        </button>
                    )}

                    <button onClick={() => handleMenuAction(onViewFlow)}>
                        <span className="menu-icon">👁️</span> Xem luồng ký
                    </button>

                    <button onClick={() => handleMenuAction(onViewRelated)}>
                        <span className="menu-icon">🔗</span> Xem tài liệu liên quan
                    </button>

                    {canUploadAttachment && (
                        <button onClick={() => handleMenuAction(onUploadAttachment)}>
                            <span className="menu-icon">📎</span> Tải lên đính kèm
                        </button>
                    )}

                    {canExtend && (
                        <button onClick={() => handleMenuAction(onExtend)}>
                            <span className="menu-icon">⏰</span> Gia hạn hợp đồng
                        </button>
                    )}

                    {canShare && (
                        <button onClick={() => handleMenuAction(onShare)}>
                            <span className="menu-icon">📤</span> Chia sẻ hợp đồng
                        </button>
                    )}

                    <button onClick={() => handleMenuAction(onCopy)}>
                        <span className="menu-icon">📋</span> Sao chép tài liệu
                    </button>

                    <div className="menu-divider"></div>

                    <button className="delete-btn" onClick={handleDelete}>
                        <span className="menu-icon">🗑️</span> Xóa tài liệu
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