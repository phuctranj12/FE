import React, { useEffect, useState } from "react";
import serverCertificateService from "../../api/serverCertificateService";
import "../../styles/certificateDetailsModal.css";

function CertificateDetailsModal({ open, certificateId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !certificateId) return;
        setLoading(true);
        serverCertificateService
            .findCertById(certificateId)
            .then((res) => setData(res))
            .catch((e) => {
                console.error(e);
                alert("Lỗi lấy thông tin chứng thư");
            })
            .finally(() => setLoading(false));
    }, [open, certificateId]);

    if (!open) return null;

    // Trích xuất subject, CCCD/MST từ certInformation
    const info = data?.certInformation || "";
    const cnMatch = info.match(/CN=([^,]+)/);
    const cccdMatch = info.match(/UID=CCCD:([^,]+)/);
    const mstMatch = info.match(/UID=MST:([^,]+)/);

    const subject = cnMatch ? cnMatch[1] : "";
    const cccd = cccdMatch ? cccdMatch[1] : "";
    const mst = mstMatch ? mstMatch[1] : "";

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "";

    return (
        <div className="certDetails-backdrop" onClick={onClose}>
            <div className="certDetails-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="certDetails-title">Chi tiết chứng thư</h3>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        Đang tải...
                    </p>
                ) : (
                    <>
                        <div className="certDetails-section">
                            <h4 className="certDetails-subtitle">Thông tin chung</h4>

                            <div className="certDetails-row">
                                <div className="certDetails-label">Ký hiệu:</div>
                                <div className="certDetails-value">{data?.keystoreSerialNumber || "-"}</div>
                            </div>

                            <div className="certDetails-row">
                                <div className="certDetails-label">Chủ thể:</div>
                                <div className="certDetails-value">{subject || "-"}</div>
                            </div>

                            <div className="certDetails-row">
                                <div className="certDetails-label">MST/CCCD:</div>
                                <div className="certDetails-value">{cccd || mst || "-"}</div>
                            </div>
                        </div>

                        <div className="certDetails-section">
                            <h4 className="certDetails-subtitle">Thời hạn</h4>

                            <div className="certDetails-row">
                                <div className="certDetails-label">Ngày bắt đầu:</div>
                                <div className="certDetails-value">{formatDate(data?.keystoreDateStart) || "-"}</div>
                            </div>

                            <div className="certDetails-row">
                                <div className="certDetails-label">Ngày hết hạn:</div>
                                <div className="certDetails-value">{formatDate(data?.keystoreDateEnd) || "-"}</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="certDetails-footer">
                    <button className="certDetails-closeBtn" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CertificateDetailsModal;