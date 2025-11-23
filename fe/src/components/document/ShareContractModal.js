import React, { useState } from "react";
import "../../styles/modal.css";
import documentService from "../../api/documentService";

function ShareContractModal({ show, onClose, contractId, contractName }) {
    const [emails, setEmails] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleAddEmail = () => {
        setEmails([...emails, ""]);
    };

    const handleRemoveEmail = (index) => {
        const newEmails = emails.filter((_, i) => i !== index);
        setEmails(newEmails.length > 0 ? newEmails : [""]);
    };

    const handleEmailChange = (index, value) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    const validateEmails = () => {
        const validEmails = emails.filter(email => email.trim() !== "");
        if (validEmails.length === 0) {
            setError("Vui lòng nhập ít nhất một email");
            return null;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = validEmails.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            setError(`Email không hợp lệ: ${invalidEmails.join(", ")}`);
            return null;
        }

        return validEmails;
    };

    const handleShare = async () => {
        setError("");
        setSuccess("");

        const validEmails = validateEmails();
        if (!validEmails) return;

        setLoading(true);
        try {
            await documentService.shareContract(contractId, validEmails);
            setSuccess(`Đã chia sẻ thành công cho ${validEmails.length} email`);
            setTimeout(() => {
                onClose();
                setEmails([""]);
                setSuccess("");
            }, 2000);
        } catch (err) {
            setError("Không thể chia sẻ tài liệu. Vui lòng thử lại.");
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
                    <h3>Chia sẻ tài liệu</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p className="share-info">
                        <strong>Tài liệu:</strong> {contractName}
                    </p>
                    <p className="share-note">
                        <em>Lưu ý: Chỉ chia sẻ được hợp đồng đã hoàn thành (status = 30)</em>
                    </p>

                    <div className="email-list">
                        <label><strong>Email người nhận:</strong></label>
                        {emails.map((email, index) => (
                            <div key={index} className="email-input-group">
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                />
                                {emails.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-remove-email"
                                        onClick={() => handleRemoveEmail(index)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="btn-add-email"
                        onClick={handleAddEmail}
                    >
                        + Thêm email
                    </button>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleShare}
                        disabled={loading}
                    >
                        {loading ? "Đang chia sẻ..." : "Chia sẻ"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareContractModal;