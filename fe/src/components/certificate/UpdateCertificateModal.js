import React, { useEffect, useState } from "react";
import certificateService from "../../api/serverCertificateService";
import "../../styles/updateCert.css";

function CertificateUpdateModal({ open, certificateId, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        organization: "",
        emails: [],
        phones: [],
        status: true,
        keystoreSerialNumber: "",
        keystoreFileName: "",
        keystoreName: "",
        keystoreDateStart: "",
        keystoreDateEnd: "",
        subject: "",
        unit: "",
        city: "",
        state: "",
        country: "",
    });

    useEffect(() => {
        if (!open || !certificateId) return;
        setLoading(true);

        certificateService
            .findCertById(certificateId)
            .then((res) => {
                if (!res) return;
                const info = res.certInformation || "";

                const getField = (regex) => (info.match(regex) ? info.match(regex)[1] : "");

                setFormData({
                    organization: getField(/O=([^,]+)/) || "",
                    emails: res.email ? [res.email] : [],
                    phones: res.phone ? [res.phone] : [],
                    status: res.status === 1,
                    keystoreSerialNumber: res.keystoreSerialNumber || "",
                    keystoreFileName: res.keyStoreFileName || "",
                    keystoreName: res.keystoreName || "",
                    keystoreDateStart: res.keystoreDateStart || "",
                    keystoreDateEnd: res.keystoreDateEnd || "",
                    subject: getField(/CN=([^,]+)/) || "",
                    unit: getField(/OU=([^,]+)/) || "",
                    city: getField(/L=([^,]+)/) || "",
                    state: getField(/ST=([^,]+)/) || "",
                    country: getField(/C=([^,]+)/) || "",
                });
            })
            .catch((e) => {
                console.error(e);
                alert("Lỗi lấy dữ liệu chứng thư");
            })
            .finally(() => setLoading(false));
    }, [open, certificateId]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await certificateService.updateUserFromCert({
                certificateId,
                status: formData.status ? 1 : 0,
                emails: formData.emails
            });
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            console.error("❌ Lỗi cập nhật chứng thư:", err);
            alert("Cập nhật thất bại, kiểm tra console");
        }
    };

    return (
        <div className="update-modal-backdrop" onClick={onClose}>
            <div className="update-modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Chỉnh sửa chứng thư</h2>
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <div className="update-modal-form">
                        <label>
                            Tổ chức:
                            <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
                        </label>
                        <label>
                            Email:
                            <input
                                type="text"
                                name="emails"
                                value={formData.emails.join(", ")}
                                onChange={(e) =>
                                    setFormData({ ...formData, emails: e.target.value.split(",").map(em => em.trim()) })
                                }
                            />
                        </label>
                        <label>
                            Điện thoại:
                            <input
                                type="text"
                                name="phones"
                                value={formData.phones.join(", ")}
                                onChange={(e) =>
                                    setFormData({ ...formData, phones: e.target.value.split(",").map(p => p.trim()) })
                                }
                            />
                        </label>
                        <label>
                            Trạng thái:
                            <select
                                name="status"
                                value={formData.status ? 1 : 0}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value === "1" })}
                            >
                                <option value={1}>Hoạt động</option>
                                <option value={0}>Không hoạt động</option>
                            </select>
                        </label>
                        <label>
                            Ký hiệu:
                            <input type="text" name="keystoreSerialNumber" value={formData.keystoreSerialNumber} onChange={handleChange} />
                        </label>
                        <label>
                            Tên file:
                            <input type="text" name="keystoreName" value={formData.keystoreName} onChange={handleChange} />
                        </label>
                        <label>
                            File chứng thư:
                            <input type="text" name="keystoreFileName" value={formData.keystoreFileName} onChange={handleChange} />
                        </label>
                        <label>
                            Chủ thể:
                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} />
                        </label>
                        <label>
                            Đơn vị:
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} />
                        </label>
                        <label>
                            Thành phố:
                            <input type="text" name="city" value={formData.city} onChange={handleChange} />
                        </label>
                        <label>
                            Tỉnh/Bang:
                            <input type="text" name="state" value={formData.state} onChange={handleChange} />
                        </label>
                        <label>
                            Quốc gia:
                            <input type="text" name="country" value={formData.country} onChange={handleChange} />
                        </label>
                        <label>
                            Ngày bắt đầu:
                            <input type="datetime-local" name="keystoreDateStart" value={formData.keystoreDateStart} onChange={handleChange} />
                        </label>
                        <label>
                            Ngày hết hạn:
                            <input type="datetime-local" name="keystoreDateEnd" value={formData.keystoreDateEnd} onChange={handleChange} />
                        </label>
                    </div>
                )}
                <div className="update-modal-footer">
                    <button onClick={handleSubmit}>Lưu</button>
                    <button onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
}

export default CertificateUpdateModal;
