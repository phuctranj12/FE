import React, { useState, useEffect } from "react";
import "../../styles/modal.css";
import documentService from "../../api/documentService";

function ExtendContractModal({ show, onClose, contractId, currentExpireTime }) {
    const [newExpireTime, setNewExpireTime] = useState("");
    const [signTime, setSignTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (show && currentExpireTime) {
            // Format datetime-local từ ISO string
            const date = new Date(currentExpireTime);
            const formatted = date.toISOString().slice(0, 16);
            setNewExpireTime(formatted);
        }
    }, [show, currentExpireTime]);

    const handleExtend = async () => {
        setError("");
        setSuccess("");

        if (!newExpireTime) {
            setError("Vui lòng chọn thời gian hết hạn mới");
            return;
        }

        if (!signTime) {
            setError("Vui lòng chọn thời gian hết hạn ký");
            return;
        }

        const newDate = new Date(newExpireTime);
        const currentDate = new Date(currentExpireTime);
        const signDate = new Date(signTime);

        if (newDate <= currentDate) {
            setError("Thời gian mới phải sau thời gian hiện tại");
            return;
        }

        if (signDate >= newDate) {
            setError("Thời gian hết hạn ký phải trước thời gian hết hạn hợp đồng");
            return;
        }

        setLoading(true);
        try {
            // Gọi API update contract với thời gian mới
            await documentService.updateContract(contractId, {
                contractExpireTime: new Date(newExpireTime).toISOString(),
                signTime: new Date(signTime).toISOString()
            });

            setSuccess("Gia hạn hợp đồng thành công!");
            setTimeout(() => {
                onClose();
                window.location.reload(); // Reload để cập nhật dữ liệu
            }, 1500);
        } catch (err) {
            setError("Không thể gia hạn hợp đồng. Vui lòng thử lại.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Gia hạn hợp đồng</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label><strong>Thời gian hết hạn hiện tại:</strong></label>
                        <p className="current-time">
                            {new Date(currentExpireTime).toLocaleString("vi-VN")}
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="signTime">
                            <strong>Thời gian hết hạn ký: *</strong>
                        </label>
                        <input
                            type="datetime-local"
                            id="signTime"
                            className="datetime-input"
                            value={signTime}
                            onChange={(e) => setSignTime(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newExpireTime">
                            <strong>Thời gian hết hạn mới: *</strong>
                        </label>
                        <input
                            type="datetime-local"
                            id="newExpireTime"
                            className="datetime-input"
                            value={newExpireTime}
                            onChange={(e) => setNewExpireTime(e.target.value)}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleExtend}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Gia hạn"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExtendContractModal;