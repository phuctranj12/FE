import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ConfirmDeleteModal({ show, onClose, onConfirm, documentName }) {
    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <h5 className="modal-title text-danger fw-bold">
                            Xác nhận xoá tài liệu
                        </h5>
                    </div>
                    <div className="modal-body">
                        <p>
                            Bạn có chắc chắn muốn xoá tài liệu{" "}
                            <strong>{documentName}</strong> không?
                        </p>
                        <p className="text-muted">
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Huỷ
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onConfirm}
                        >
                            Đồng ý xoá
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
