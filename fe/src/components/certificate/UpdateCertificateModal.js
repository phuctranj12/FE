import React, { useEffect, useState } from "react";
import certificateService from "../../api/serverCertificateService";
import "../../styles/updateCert.css";
import Notiflix from "notiflix";

function UpdateCertificateModal({ open, certificateId, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [certInfo, setCertInfo] = useState(null);
    const [emailsText, setEmailsText] = useState("");
    const [status, setStatus] = useState(1);

    useEffect(() => {
        if (!open || !certificateId) return;

        const fetchCertDetails = async () => {
            setLoading(true);
            try {
                const data = await certificateService.findCertById(certificateId);
                console.log("📥 Dữ liệu cert nhận được:", data);

                setCertInfo(data);
                const emails = data.email ? [data.email] : [];
                setEmailsText(emails.join(", "));
                setStatus(data.status || 1);

            } catch (error) {
                console.error("❌ Lỗi lấy thông tin cert:", error);
                Notiflix.Notify.failure("Không thể tải thông tin chứng thư!");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchCertDetails();
    }, [open, certificateId]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!certificateId) {
            Notiflix.Notify.warning("Không tìm thấy ID chứng thư!");
            return;
        }

        // Parse emails
        const emails = emailsText
            .split(/[\s,;]+/)
            .map(e => e.trim())
            .filter(Boolean);

        setLoading(true);
        try {
            await certificateService.updateUserFromCert({
                certificateId: certificateId,
                status: status,
                emails: emails
            });

            Notiflix.Notify.success("Cập nhật chứng thư thành công!");

            // Reset form
            setEmailsText("");
            setStatus(1);
            setCertInfo(null);

            if (onUpdated) onUpdated();
            onClose();

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            const errorMsg = err?.response?.data?.message || err?.message || "Cập nhật thất bại!";
            Notiflix.Notify.failure(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getCertField = (regex) => {
        if (!certInfo?.certInformation) return "";
        const match = certInfo.certInformation.match(regex);
        return match ? match[1] : "";
    };

    return (
        <div className="update-modal-backdrop" onClick={onClose}>
            <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Cập nhật chứng thư số</h2>

                {loading ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : certInfo ? (
                    <>
                        <div className="info-section" style={{
                            background: "#f5f5f5",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}>
                            <h4 style={{ marginTop: 0 }}>Thông tin chứng thư</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                                <div>
                                    <strong>Ký hiệu:</strong>
                                    <p>{certInfo.keystoreSerialNumber}</p>
                                </div>
                                <div>
                                    <strong>Tên file:</strong>
                                    <p>{certInfo.keyStoreFileName}</p>
                                </div>
                                <div>
                                    <strong>Chủ thể (CN):</strong>
                                    <p>{getCertField(/CN=([^,]+)/)}</p>
                                </div>
                                <div>
                                    <strong>Tổ chức (O):</strong>
                                    <p>{getCertField(/O=([^,]+)/)}</p>
                                </div>
                                <div>
                                    <strong>MST:</strong>
                                    <p>{getCertField(/UID=MST:([^,]+)/)}</p>
                                </div>
                                <div>
                                    <strong>CCCD:</strong>
                                    <p>{getCertField(/UID=CCCD:([^,]+)/)}</p>
                                </div>
                                <div>
                                    <strong>Ngày bắt đầu:</strong>
                                    <p>{certInfo.keystoreDateStart ? new Date(certInfo.keystoreDateStart).toLocaleString("vi-VN") : "N/A"}</p>
                                </div>
                                <div>
                                    <strong>Ngày hết hạn:</strong>
                                    <p>{certInfo.keystoreDateEnd ? new Date(certInfo.keystoreDateEnd).toLocaleString("vi-VN") : "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="update-modal-form">
                            {/* <h4>Thông tin có thể chỉnh sửa</h4> */}

                            <label>
                                <strong>Email người dùng:</strong>
                                <small style={{ display: "block", color: "#666", marginBottom: "5px" }}>
                                    Phân tách nhiều email bằng dấu phẩy
                                </small>
                                <textarea
                                    value={emailsText}
                                    onChange={(e) => setEmailsText(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        fontSize: "14px"
                                    }}
                                />
                            </label>

                            <label>
                                <strong>Trạng thái:</strong>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(Number(e.target.value))}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        fontSize: "14px",
                                        marginTop: "5px"
                                    }}
                                >
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Không hoạt động</option>
                                </select>
                            </label>
                        </div>

                        <div className="update-modal-footer" style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "20px"
                        }}>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    background: "white",
                                    color: "#000",
                                    cursor: "pointer"
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    border: "none",
                                    background: "#0B57D0",
                                    color: "white",
                                    cursor: "pointer"
                                }}
                            >
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Không tìm thấy thông tin chứng thư</p>
                )}
            </div>
        </div>
    );
}

export default UpdateCertificateModal;