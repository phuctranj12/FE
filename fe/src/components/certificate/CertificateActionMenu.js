import { useState, useRef, useEffect } from "react";
import UpdateCertificateModal from "./UpdateCertificateModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import "../../styles/actionMenu.css";

function CertificateActionMenu({ certificate, onViewDetails, onAssignUsers, onDelete, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
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
        if (onDelete && certificate?.id) onDelete(certificate.id);
        setShowConfirm(false);
    };

    const handleUpdate = () => {
        setShowUpdate(true);
        setOpen(false);
    };

    const handleMenuAction = (action) => {
        setOpen(false);
        if (action) action(certificate);
    };

    return (
        <div className="action-menu" ref={menuRef}>
            <button className="dots-btn" onClick={toggleMenu}>
                ⋮
            </button>

            {open && (
                <div className="action-dropdown">
                    <button onClick={() => handleMenuAction(onViewDetails)}>Xem</button>
                    <button onClick={() => handleMenuAction(onAssignUsers)}>Gán người dùng</button>
                    <button onClick={handleUpdate}>Cập nhật chứng thư</button>

                    <div className="menu-divider"></div>

                    <button className="delete-btn" onClick={handleDelete}>Xóa</button>
                </div>
            )}

            {/* Modal cập nhật chứng thư */}
            {showUpdate && (
                <UpdateCertificateModal
                    open={showUpdate}
                    certificate={certificate}
                    onClose={() => setShowUpdate(false)}
                    onUpdated={onUpdate}
                />
            )}

            {/* Modal xác nhận xóa */}
            {showConfirm && (
                <ConfirmDeleteModal
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    documentName={certificate?.keystoreFileName || "chứng thư này"}
                />
            )}
        </div>
    );
}

export default CertificateActionMenu;
