import React from "react";
import "../../styles/modal.css";

function ConfirmDeleteModal({ show, onClose, onConfirm, documentName }) {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Xác nhận xóa tài liệu</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p>Bạn có chắc chắn muốn xóa tài liệu <strong>"{documentName}"</strong>?</p>
                    <p className="warning-text">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn-confirm-delete" onClick={onConfirm}>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;