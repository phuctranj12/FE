import { useState, useRef, useEffect } from "react";
import "../../styles/templateActionMenu.css";

function TemplateActionMenu({ template, isShared = false, onEdit, onBatchCreate, onSingleCreate, onStopPublish, onShare, onCopy, onCreateWithFlow, onDelete }) {
    const [open, setOpen] = useState(false);
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

    const handleAction = (action, e) => {
        e && e.stopPropagation(); // Ngăn event bubbling
        
        const handlers = {
            edit: onEdit,
            singleCreate: onSingleCreate,
            share: onShare,
            copy: onCopy,
            delete: onDelete
        };

        if (handlers[action] && template) {
            handlers[action](template);
        }
        setOpen(false);
    };

    return (
        <div className="template-action-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button className="dots-btn" onClick={(e) => { e.stopPropagation(); toggleMenu(); }}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#9CA3AF" 
                    strokeWidth="2" 
                    strokeLinecap="橘子round" 
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                </svg>
            </button>

            {open && (
                <div className="action-dropdown">
                    {!isShared && (
                        <>
                            <button className="action-item edit-item" onClick={(e) => handleAction('edit', e)}>
                                <svg className="action-icon-template" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Sửa mẫu tài liệu</span>
                            </button>

                            <button className="action-item share-item" onClick={(e) => handleAction('share', e)}>
                                <svg className="action-icon-template" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                                <span>Chia sẻ</span>
                            </button>

                            <button className="action-item copy-item" onClick={(e) => handleAction('copy', e)}>
                                <svg className="action-icon-template" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 chased 2 2v1"></path>
                                </svg>
                                <span>Sao chép mẫu tài liệu</span>
                            </button>
                        </>
                    )}

                    <button className="action-item single-item" onClick={(e) => handleAction('singleCreate', e)}>
                        <svg className="action-icon-template" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>Tạo tài liệu đơn lẻ theo mẫu</span>
                    </button>

                    {!isShared && (
                        <button className="action-item delete-item" onClick={(e) => handleAction('delete', e)}>
                            <svg className="action-icon-template" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EE4235" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Xóa mẫu tài liệu</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TemplateActionMenu;
