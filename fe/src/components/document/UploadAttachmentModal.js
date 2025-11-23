import React, { useState } from "react";
import "../../styles/modal.css";
import documentService from "../../api/documentService";

function UploadAttachmentModal({ show, onClose, contractId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Kiểm tra định dạng file (chấp nhận PDF, DOC, DOCX, JPG, PNG)
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Chỉ chấp nhận file PDF, DOC, DOCX, JPG, PNG");
                setFile(null);
                return;
            }

            // Kiểm tra kích thước file (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File không được vượt quá 10MB");
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError("");
        }
    };

    const handleUpload = async () => {
        setError("");
        setSuccess("");

        if (!file) {
            setError("Vui lòng chọn file");
            return;
        }

        if (!fileName.trim()) {
            setError("Vui lòng nhập tên tài liệu");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Upload file lên Minio
            const uploadResult = await documentService.uploadFileToMinio(file);
            const path = uploadResult?.data?.path;

            if (!path) {
                throw new Error("Không lấy được đường dẫn file");
            }

            // Bước 2: Lưu thông tin vào DB với type = 3 (ATTACH)
            const documentData = {
                name: fileName,
                type: 3, // ATTACH
                contractId: contractId,
                fileName: file.name,
                path: path,
                status: 1
            };

            await documentService.saveDocument(documentData);

            setSuccess("Tải lên file đính kèm thành công!");

            setTimeout(() => {
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                onClose();
                resetForm();
            }, 1500);

        } catch (err) {
            setError("Không thể tải lên file. Vui lòng thử lại.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileName("");
        setError("");
        setSuccess("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tải lên file đính kèm</h3>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="fileName">
                            <strong>Tên tài liệu: *</strong>
                        </label>
                        <input
                            type="text"
                            id="fileName"
                            className="text-input"
                            placeholder="Nhập tên tài liệu"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fileUpload">
                            <strong>Chọn file: *</strong>
                        </label>
                        <input
                            type="file"
                            id="fileUpload"
                            className="file-input"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                        {file && (
                            <p className="file-info">
                                Đã chọn: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    <p className="upload-note">
                        <em>Chấp nhận: PDF, DOC, DOCX, JPG, PNG (Tối đa 10MB)</em>
                    </p>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={handleClose} disabled={loading}>
                        Hủy
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        {loading ? "Đang tải lên..." : "Tải lên"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UploadAttachmentModal;