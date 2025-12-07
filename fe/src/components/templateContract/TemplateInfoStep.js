import React from 'react';
import '../../styles/documentForm.css';

function TemplateInfoStep({
    formData,
    handleInputChange,
    handleFileUpload,
    handleAttachedFilesUpload,
    removeAttachedFile
}) {
    const documentTypes = [
        { value: "", label: "Chọn loại tài liệu" },
        { value: "1", label: "Tài liệu gốc" },
        { value: "2", label: "Tài liệu khách hàng" },
        { value: "3", label: "Tài liệu đính kèm" },
        { value: "4", label: "Tài liệu hợp đồng theo lô" }
    ];

    return (
        <div className="step-content">
            <div 
                className="file-upload-area" 
                onClick={() => {
                    const input = document.getElementById('file-upload-template');
                    if (input) input.click();
                }}
            >
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
                <label 
                    htmlFor="file-upload-template" 
                    className="file-upload-label"
                    onClick={(e) => e.stopPropagation()}
                >
                    {formData.pdfFileName || 'Chọn file'}
                </label>
            </div>

            <div className="form-content">
                <div className="left-column">
                    <div className="form-group">
                        <label>
                            Tên mẫu tài liệu <span className="required">*</span>
                        </label>
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
                        <label>
                            Ngày bắt đầu hiệu lực <span className="required">*</span>
                        </label>
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
                        <label>
                            Mã mẫu tài liệu <span className="required">*</span>
                        </label>
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
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar,.txt,.xls,.xlsx"
                                onChange={handleAttachedFilesUpload}
                                style={{ display: 'none' }}
                                id="attached-files-upload"
                                multiple
                            />
                            <label 
                                htmlFor="attached-files-upload" 
                                className="attach-file-upload-label"
                                style={{ 
                                    cursor: 'pointer', 
                                    display: 'inline-block', 
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    background: '#fff'
                                }}
                            >
                                {formData.attachedFiles?.length > 0 
                                    ? `${formData.attachedFiles.length} file(s) đã chọn` 
                                    : 'Chọn file đính kèm'}
                            </label>
                        </div>
                        {formData.attachedFiles && formData.attachedFiles.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                {formData.attachedFiles.map((file, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span>📎 {file.name}</span>
                                        <button 
                                            type="button"
                                            onClick={() => removeAttachedFile(index)}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                color: '#f44336', 
                                                cursor: 'pointer',
                                                fontSize: '16px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>
                            Ngày kết thúc hiệu lực <span className="required">*</span>
                        </label>
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

