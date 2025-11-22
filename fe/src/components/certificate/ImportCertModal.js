import React, { useState, useRef } from "react";
import certificateService from "../../api/serverCertificateService";
import "../../styles/importCertModal.css";

function ImportCertModal({ open, onClose, onImported }) {
    const [file, setFile] = useState(null);
    const [emailsText, setEmailsText] = useState(""); // thêm email input
    const [password, setPassword] = useState("");     // thêm password input
    const [status, setStatus] = useState(1);          // trạng thái
    const [loading, setLoading] = useState(false);
    const dropRef = useRef();

    if (!open) return null;

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleImport = async () => {
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
            const formData = new FormData();
            formData.append("file", file);

            // chuyển emailsText thành mảng và append vào FormData
            const emails = emailsText
                .split(/[\s,;]+/)
                .map(s => s.trim())
                .filter(Boolean);
            emails.forEach(e => formData.append("list_email", e));

            formData.append("password", password);
            formData.append("status", status);

            await certificateService.importCert(formData);

            alert("Import chứng thư thành công!");
            onImported();
            onClose();
        } catch (error) {
            console.error("Lỗi import:", error);
            alert("Import thất bại!");
        }

        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Import chứng thư số</h3>

                <div className="file-drop-zone"
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {file ? <p>{file.name}</p> : <p>Kéo thả file .p12 vào đây hoặc click để chọn</p>}
                    <input type="file" accept=".p12,.pem,.cer" onChange={handleFileChange} />
                </div>

                <div className="input-group">
                    <label>Password chứng thư:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="input-group">
                    <label>Emails (phân tách bằng dấu phẩy):</label>
                    <textarea value={emailsText} onChange={(e) => setEmailsText(e.target.value)} />
                </div>

                <div className="input-group">
                    <label>Trạng thái:</label>
                    <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                        <option value={1}>Hoạt động</option>
                        <option value={0}>Không hoạt động</option>
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Huỷ</button>
                    <button className="btn-primary" onClick={handleImport} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImportCertModal;
