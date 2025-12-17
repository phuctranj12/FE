// src/components/certificate/AssignUsersModal.jsx
import React, { useState } from "react";
import serverCertificateService from "../../api/serverCertificateService";
import "../../styles/assignUsersModal.css";

function AssignUsersModal({ open, certificateId, onClose, onAssigned }) {
    const [emailsText, setEmailsText] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        const emails = emailsText
            .split(/[\s,;]+/)
            .map(s => s.trim())
            .filter(Boolean);

        setLoading(true);
        try {
            await serverCertificateService.updateUserFromCert({
                certificateId,
                status,
                emails
            });
            alert("Cập nhật user thành công");
            onAssigned && onAssigned();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Lỗi cập nhật user");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="assign-users-modal-backdrop">
            <div className="assign-users-modal">
                <h3>Gán user vào chứng thư</h3>

                <div className="assign-users-field">
                    <label>Nhập email (phân tách bằng dấu phẩy)</label>
                    <textarea
                        value={emailsText}
                        onChange={(e) => setEmailsText(e.target.value)}
                    />
                </div>

                <div className="assign-users-field">
                    <label>Trạng thái user</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(Number(e.target.value))}
                    >
                        <option value={1}>Hoạt động</option>
                        <option value={0}>Không hoạt động</option>
                    </select>
                </div>

                <div className="assign-users-actions">
                    <button
                        className="assign-users-btn-primary"
                        onClick={handleAssign}
                        disabled={loading}
                    >
                        {loading ? "Đang..." : "Cập nhật"}
                    </button>

                    <button
                        className="assign-users-btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignUsersModal;
