import React, { useState, useEffect } from "react";
import "../../styles/modal.css";
import documentService from "../../api/documentService";

function ViewFlowModal({ show, onClose, contractId }) {
    const [flowData, setFlowData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && contractId) {
            fetchFlowData();
        }
    }, [show, contractId]);

    const fetchFlowData = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await documentService.getSignFlow(contractId);
            setFlowData(data?.data || data);
        } catch (err) {
            setError("Không thể tải thông tin luồng ký");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 1: return "Điều phối";
            case 2: return "Xem xét";
            case 3: return "Ký";
            case 4: return "Văn thư";
            default: return "Không xác định";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return "Chưa xử lý";
            case 20: return "Đang xử lý";
            case 30: return "Hoàn thành";
            case 31: return "Từ chối";
            case 32: return "Hủy bỏ";
            case 1: return "Sắp hết hạn";
            case 2: return "Hết hạn";
            default: return "Không xác định";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return "status-pending";
            case 1: return "status-processing";
            case 2: return "status-completed";
            default: return "";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Chưa có";
        return new Date(date).toLocaleString("vi-VN");
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Luồng ký tài liệu</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {loading && <p>Đang tải...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {flowData && (
                        <div className="flow-container">
                            {/* Thông tin người tạo */}
                            <div className="flow-creator">
                                <h4>Người tạo</h4>
                                <div className="creator-info">
                                    <p><strong>Tên:</strong> {flowData.createdBy?.name}</p>
                                    <p><strong>Email:</strong> {flowData.createdBy?.email}</p>
                                    <p><strong>Thời gian tạo:</strong> {formatDate(flowData.createdAt)}</p>
                                </div>
                            </div>

                            {/* Trạng thái hợp đồng */}
                            <div className="contract-status-section">
                                <h4>Trạng thái hợp đồng</h4>
                                <p className={`status-badge ${getStatusClass(flowData.contractStatus)}`}>
                                    {getStatusLabel(flowData.contractStatus)}
                                </p>
                            </div>

                            {/* Lý do hủy (nếu có) */}
                            {flowData.reasonCancel && (
                                <div className="cancel-reason">
                                    <h4>{flowData.contractStatus === 31 ? "Lý do từ chối" : "Lý do hủy bỏ"}</h4>
                                    <p>{flowData.reasonCancel}</p>
                                    <p><strong>Ngày hủy:</strong> {formatDate(flowData.cancelDate)}</p>
                                </div>
                            )}

                            {/* Danh sách người xử lý */}
                            <div className="recipients-section">
                                <h4>Danh sách người xử lý</h4>
                                {flowData.recipients && flowData.recipients.length > 0 ? (
                                    <div className="recipients-list">
                                        {flowData.recipients.map((recipient, index) => (
                                            <div key={recipient.id} className="recipient-card">
                                                <div className="recipient-header">
                                                    <span className="recipient-number">{index + 1}</span>
                                                    <span className={`status-badge ${getStatusClass(recipient.status)}`}>
                                                        {getStatusLabel(recipient.status)}
                                                    </span>
                                                </div>
                                                <div className="recipient-body">
                                                    <p><strong>Tên:</strong> {recipient.name}</p>
                                                    <p><strong>Email:</strong> {recipient.email}</p>
                                                    <p><strong>Vai trò:</strong> {getRoleLabel(recipient.role)}</p>
                                                    <p><strong>Tổ chức:</strong> {recipient.participantName}</p>
                                                    <p><strong>Thứ tự xử lý:</strong> {recipient.ordering}</p>
                                                    {recipient.processAt && (
                                                        <p><strong>Thời gian xử lý:</strong> {formatDate(recipient.processAt)}</p>
                                                    )}
                                                    {recipient.reasonReject && (
                                                        <p className="reject-reason">
                                                            <strong>Lý do từ chối:</strong> {recipient.reasonReject}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Chưa có người xử lý</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

export default ViewFlowModal;