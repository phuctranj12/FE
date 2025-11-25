import React from "react";
import "../../styles/modal.css";

function ConfirmDeleteModal({ show, onClose, onConfirm, documentName }) {
    if (!show) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Xác nhận xóa</h3>
                <p>Bạn có chắc chắn muốn xóa <strong>{documentName}</strong> không?</p>
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button onClick={onConfirm}>Xóa</button>
                    <button onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
