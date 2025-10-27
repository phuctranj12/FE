import React from 'react';
import '../../styles/documentForm.css';

function TemplateInfoStep({ formData, handleInputChange, handleFileUpload }) {
    const documentTypes = [
        { value: "", label: "Chọn loại tài liệu" },
        { value: "1", label: "Tài liệu gốc" },
        { value: "2", label: "Tài liệu khách hàng" },
        { value: "3", label: "Tài liệu đính kèm" },
        { value: "4", label: "Tài liệu hợp đồng theo lô" }
    ];

    return (
        <div className="step-content">
            <div className="file-upload-area">
                <div className="upload-icon">⬆️</div>
                <div className="upload-text">
                    Kéo thả hoặc tải lên file tài liệu <span className="highlight">Tại đây</span>
                </div>
                <div className="upload-support">Hỗ trợ file PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR, TXT, XLS, XLSX</div>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar,.txt,.xls,.xlsx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload-template"
                />
                <label htmlFor="file-upload-template" className="file-upload-label">
                    {formData.attachedFile || 'Chọn file'}
                </label>
            </div>

            <div className="form-content">
                <div className="left-column">
                    <div className="form-group">
                        <label>Tên mẫu tài liệu *</label>
                        <input
                            type="text"
                            name="templateName"
                            value={formData.templateName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên mẫu tài liệu"
                        />
                    </div>
                    <div className="form-group">
                        <label>Loại tài liệu</label>
                        <div className="dropdown-container">
                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleInputChange}
                            >
                                {documentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <span className="dropdown-icon">▼</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu hiệu lực *</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                            />
                            <span className="calendar-icon">📅</span>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="form-group">
                        <label>Mã mẫu tài liệu *</label>
                        <input
                            type="text"
                            name="templateCode"
                            value={formData.templateCode}
                            onChange={handleInputChange}
                            placeholder="Nhập mã mẫu tài liệu"
                        />
                    </div>
                    <div className="form-group">
                        <label>File đính kèm</label>
                        <div className="file-input-container">
                            <input
                                type="text"
                                name="attachedFile"
                                value={formData.attachedFile}
                                onChange={handleInputChange}
                                placeholder="Chọn file đính kèm (PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR, TXT, XLS, XLSX)"
                                readOnly
                            />
                            <span className="attachment-icon">📎</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Ngày kết thúc hiệu lực *</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                            />
                            <span className="calendar-icon">📅</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TemplateInfoStep;

