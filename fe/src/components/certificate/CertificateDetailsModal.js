// src/components/certificate/CertificateDetailsModal.jsx
import React, { useEffect, useState } from "react";
import serverCertificateService from "../../api/serverCertificateService";

function CertificateDetailsModal({ open, certificateId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !certificateId) return;
        setLoading(true);
        serverCertificateService.certInformation(certificateId)
            .then((res) => setData(res))
            .catch((e) => {
                console.error(e);
                alert("Lỗi lấy thông tin chứng thư");
            })
            .finally(() => setLoading(false));
    }, [open, certificateId]);

    if (!open) return null;
    return (
        <div className="modal-backdrop">
            <div className="modal wide">
                <h3>Chi tiết chứng thư</h3>
                {loading ? <p>Đang tải...</p> : (
                    <div>
                        <p><strong>Ký hiệu:</strong> {data?.signId || data?.serialNumber}</p>
                        <p><strong>Chủ thể:</strong> {data?.subject}</p>
                        <p><strong>MST/CCCD:</strong> {data?.mst}</p>
                        <p><strong>Ngày bắt đầu:</strong> {data?.startDate}</p>
                        <p><strong>Ngày hết hạn:</strong> {data?.endDate}</p>
                        <p><strong>Issuer:</strong> {data?.issuer}</p>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
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
