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
        <div className="modal-backdrop"
            onClick={onClose} >
            <div className="modal wide"
                onClick={(e) => e.stopPropagation()}>
                <h3>Chi tiết chứng thư</h3>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <div>
                        <p>
                            <strong>Ký hiệu:</strong> {data?.keystoreSerialNumber}
                        </p>
                        <p>
                            <strong>Chủ thể:</strong> {subject}
                        </p>
                        <p>
                            <strong>MST/CCCD:</strong> {cccd || mst}
                        </p>
                        <p>
                            <strong>Ngày bắt đầu:</strong> {formatDate(data?.keystoreDateStart)}
                        </p>
                        <p>
                            <strong>Ngày hết hạn:</strong> {formatDate(data?.keystoreDateEnd)}
                        </p>
                        {/* <p>
                            <strong>Issuer:</strong> {data?.issuer}
                        </p>
                        <pre style={{ whiteSpace: "pre-wrap" }}>
                            {JSON.stringify(data, null, 2)}
                        </pre> */}
                    </div>
                )}
                <div>
                    <button onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

export default CertificateDetailsModal;
