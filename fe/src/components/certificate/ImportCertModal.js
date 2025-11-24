import React, { useState, useRef } from "react";
import certificateService from "../../api/serverCertificateService";
import "../../styles/importCertModal.css";

function ImportCertModal({ open, onClose, onImported }) {
    const [file, setFile] = useState(null);
    const [emailsText, setEmailsText] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef();

    if (!open) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Kiểm tra đuôi file
            if (!selectedFile.name.endsWith('.p12')) {
                alert('Vui lòng chọn file có đuôi .p12');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (!droppedFile.name.endsWith('.p12')) {
                alert('Vui lòng chọn file có đuôi .p12');
                return;
            }
            setFile(droppedFile);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleImport = async () => {
        // Validation
        if (!file) {
            alert("Vui lòng chọn file .p12 để import!");
            return;
        }
        if (!password) {
            alert("Vui lòng nhập password chứng thư!");
            return;
        }

        setLoading(true);

        try {
            // ✅ Tạo FormData đúng cách
            const formData = new FormData();

            // 1. Append file
            formData.append("file", file);

            // 2. Append password
            formData.append("password", password);

            // 3. Append status
            formData.append("status", status);

            // 4. Append emails - QUAN TRỌNG: append từng email riêng biệt
            const emails = emailsText
                .split(/[\s,;]+/)
                .map(s => s.trim())
                .filter(Boolean);

            // ✅ Backend expect String[], nên append từng email với cùng key
            if (emails.length > 0) {
                emails.forEach(email => {
                    formData.append("list_email", email);
                });
            }

            // Debug: In ra FormData
            console.log("📦 FormData content:");
            for (let pair of formData.entries()) {
                console.log(`  ${pair[0]}: ${pair[1]}`);
            }

            // Gọi API
            await certificateService.importCert(formData);

            alert("Import chứng thư thành công!");

            // Reset form
            setFile(null);
            setEmailsText("");
            setPassword("");
            setStatus(1);

            onImported();
            onClose();

        } catch (error) {
            console.error("❌ Lỗi import:", error);
            const errorMsg = error?.message || error?.msg || "Import thất bại!";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Import chứng thư số</h3>

                <div
                    className="file-drop-zone"
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('file-input').click()}
                    style={{ cursor: 'pointer' }}
                >
                    {file ? (
                        <p>✅ {file.name}</p>
                    ) : (
                        <p>Kéo thả file .p12 vào đây hoặc click để chọn</p>
                    )}
                    <input
                        id="file-input"
                        type="file"
                        accept=".p12"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="input-group">
                    <label>Password chứng thư: *</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập password"
                    />
                </div>

                <div className="input-group">
                    <label>Emails (phân tách bằng dấu phẩy):</label>
                    <textarea
                        value={emailsText}
                        onChange={(e) => setEmailsText(e.target.value)}
                        placeholder="vd: email1@example.com, email2@example.com"
                        rows={3}
                    />
                </div>

                <div className="input-group">
                    <label>Trạng thái:</label>
                    <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                        <option value={1}>Hoạt động</option>
                        <option value={0}>Không hoạt động</option>
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>
                        Huỷ
                    </button>
                    <button className="btn-primary" onClick={handleImport} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImportCertModal;