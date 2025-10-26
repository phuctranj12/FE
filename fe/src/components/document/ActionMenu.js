import { useState, useRef, useEffect } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../../styles/actionMenu.css";

function ActionMenu({ onEdit, onViewFlow, onCopy, onDelete, doc }) {
    const [open, setOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setOpen(!open);

    // ✅ Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        // Dùng window.document chứ không phải prop doc
        window.document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = () => {
        setShowConfirm(true); // Mở popup xác nhận
        setOpen(false);       // Ẩn menu tác vụ
    };

    const handleConfirmDelete = () => {
        onDelete(doc?.id); // Gọi prop xóa thật
        setShowConfirm(false);
    };

    return (
        <div className="action-menu" ref={menuRef}>
            <button className="dots-btn" onClick={toggleMenu}>
                Action
            </button>

            {open && (
                <div className="action-dropdown">
                    <button onClick={onEdit}>Sửa tài liệu</button>
                    <button onClick={onViewFlow}>Xem luồng ký</button>
                    <button onClick={onCopy}>Sao chép tài liệu</button>
                    <button className="delete-btn" onClick={handleDelete}>
                        Xóa tài liệu
                    </button>
                </div>
            )}

            {/* Popup xác nhận xoá */}
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
