import { useState, useRef, useEffect } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ActionMenuPortal from "./ActionMenuPortal";
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
    const [position, setPosition] = useState(null);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    // Tính vị trí menu khi mở
    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 60
            });
        }
    }, [open]);

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
        if (action && doc) action(doc);
    };


    // ===== ICONS (ĐỒNG BỘ VỚI CertificateActionMenu) =====

    const ICON_FLOW = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const ICON_RELATED = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l3.53-3.53a5 5 0 1 0-7.07-7.07L12 4"></path>
            <path d="M14 11a5 5 0 0 1-7.07 0L3.4 7.47a5 5 0 1 1 7.07-7.07L10 4"></path>
        </svg>
    );

    const ICON_COPY = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    );

    const ICON_EDIT = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    );

    const ICON_UPLOAD = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    );

    const ICON_SHARE = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line>
            <line x1="15.4" y1="6.5" x2="8.6" y2="10.5"></line>
        </svg>
    );

    const ICON_EXTEND = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1 2.13-9"></path>
        </svg>
    );

    const ICON_DELETE = (
        <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    );


    // const ICON_EDIT = ICON_FLOW;
    // const ICON_UPLOAD = ICON_FLOW;
    // const ICON_SHARE = ICON_FLOW;
    // const ICON_EXTEND = ICON_FLOW;



    const getMenuActions = () => {
        const status = doc?.status;

        const commonActions = [
            { key: "viewFlow", label: "Xem luồng ký", icon: ICON_FLOW, action: onViewFlow, show: true },
            { key: "viewRelated", label: "Xem tài liệu liên quan", icon: ICON_RELATED, action: onViewRelated, show: true },
            { key: "copy", label: "Sao chép tài liệu", icon: ICON_COPY, action: onCopy, show: true }
        ];

        const statusSpecificActions = {
            0: [{ key: "edit", label: "Sửa tài liệu", icon: ICON_EDIT, action: onEdit, show: true }],
            10: [{ key: "edit", label: "Sửa tài liệu", icon: ICON_EDIT, action: onEdit, show: true }],
            20: [{ key: "uploadAttachment", label: "Tải lên đính kèm", icon: ICON_UPLOAD, action: onUploadAttachment, show: true }],
            30: [
                { key: "share", label: "Chia sẻ hợp đồng", icon: ICON_SHARE, action: onShare, show: true },
                { key: "extend", label: "Gia hạn hợp đồng", icon: ICON_EXTEND, action: onExtend, show: true },
                { key: "uploadAttachment", label: "Tải lên đính kèm", icon: ICON_UPLOAD, action: onUploadAttachment, show: true }
            ],
            1: [{ key: "extend", label: "Gia hạn hợp đồng", icon: ICON_EXTEND, action: onExtend, show: true }],
            2: [{ key: "extend", label: "Gia hạn hợp đồng", icon: ICON_EXTEND, action: onExtend, show: true }],
            40: [],
            31: [],
            32: []
        };

        const specificActions = statusSpecificActions[status] || [];
        const allActions = [...specificActions, ...commonActions];
        const canDelete = ![31, 32].includes(status);

        return { allActions, canDelete };
    };

    const { allActions, canDelete } = getMenuActions();

    return (
        <>
            <div className="action-menu">
                <button className="dots-btn" ref={triggerRef} onClick={toggleMenu}>
                    ⋮
                </button>
            </div>

            {open && (
                <ActionMenuPortal>
                    <div
                        ref={menuRef}
                        className="action-dropdown portal-dropdown"
                        style={{
                            position: "absolute",
                            top: (position?.top ?? 0) + "px",
                            left: (position?.left ?? 0) + "px",
                            zIndex: 9999
                        }}
                    >
                        {allActions.map(action =>
                            action.show ? (
                                <button
                                    key={action.key}
                                    onClick={() => handleMenuAction(action.action)}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ) : null
                        )}

                        {canDelete && (
                            <>
                                <div className="menu-divider"></div>
                                <button className="delete-btn" onClick={handleDelete}>
                                    {ICON_DELETE}
                                    Xóa tài liệu
                                </button>
                            </>
                        )}
                    </div>
                </ActionMenuPortal>
            )}

            <ConfirmDeleteModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmDelete}
                documentName={doc?.name || "này"}
            />
        </>
    );
}

export default ActionMenu;
