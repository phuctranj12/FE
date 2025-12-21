import { useState, useRef, useEffect } from "react";
import UpdateCertificateModal from "./UpdateCertificateModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ActionMenuPortal from "./ActionMenuPortal";
import "../../styles/actionMenuCert.css";

function CertificateActionMenu({ certificateId, certificateName, onViewDetails, onAssignUsers, onDelete, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [position, setPosition] = useState(null);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    // Tính toán vị trí menu khi mở
    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 60
            });
        }
    }, [open]);

    // Đóng menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                !triggerRef.current?.contains(e.target)
            ) {
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
        if (onDelete && certificateId) onDelete(certificateId);
        setShowConfirm(false);
    };

    const handleUpdate = () => {
        setShowUpdate(true);
        setOpen(false);
    };

    const ICON_VIEW = (
        <svg className="cert-menu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const ICON_ASSIGN = (
        <svg className="cert-menu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );

    const ICON_UPDATE = (
        <svg className="cert-menu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    );

    const ICON_DELETE = (
        <svg className="cert-menu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    );

    return (
        <>
            <div className="cert-action-menu">
                <button className="cert-dots-btn" ref={triggerRef} onClick={toggleMenu}>
                    ⋮
                </button>
            </div>

            {open && (
                <ActionMenuPortal>
                    <div
                        ref={menuRef}
                        className="cert-action-dropdown"
                        style={{
                            position: "fixed",
                            top: (position?.top ?? 0) + "px",
                            left: (position?.left ?? 0) + "px",
                            zIndex: 9999
                        }}
                    >
                        <button
                            className="cert-menu-item"
                            onClick={() => { setOpen(false); onViewDetails(); }}
                        >
                            {ICON_VIEW}
                            <span>Xem chi tiết</span>
                        </button>

                        <button
                            className="cert-menu-item"
                            onClick={() => { setOpen(false); onAssignUsers(); }}
                        >
                            {ICON_ASSIGN}
                            <span>Gán người dùng</span>
                        </button>

                        <button
                            className="cert-menu-item"
                            onClick={handleUpdate}
                        >
                            {ICON_UPDATE}
                            <span>Cập nhật</span>
                        </button>

                        <div className="cert-menu-divider"></div>

                        <button
                            className="cert-menu-item cert-menu-item-delete"
                            onClick={handleDelete}
                        >
                            {ICON_DELETE}
                            <span>Xóa</span>
                        </button>
                    </div>
                </ActionMenuPortal>
            )}

            {/* Modals */}
            <UpdateCertificateModal
                open={showUpdate}
                certificateId={certificateId}
                onClose={() => setShowUpdate(false)}
                onUpdated={onUpdate}
            />

            <ConfirmDeleteModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                documentName={certificateName || "chứng thư này"}
            />
        </>
    );
}

export default CertificateActionMenu;