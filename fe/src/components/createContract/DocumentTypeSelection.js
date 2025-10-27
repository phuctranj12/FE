import React from 'react';
import '../../styles/documentForm.css';

function DocumentTypeSelection({ 
    documentType, 
    setDocumentType, 
    formData, 
    handleInputChange, 
    handleFileUpload, 
    handleBatchFileUpload 
}) {
    // Batch document type
    if (documentType === 'batch') {
        return (
            <div className="step-content">
                <div className="document-type-section">
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-no-template"
                                checked={documentType === 'single-no-template'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu đơn lẻ không theo mẫu</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-template"
                                checked={documentType === 'single-template'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu đơn lẻ theo mẫu</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="batch"
                                checked={documentType === 'batch'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu theo lô</span>
                        </label>
                    </div>
                </div>

                <div className="form-content">
                    <div className="left-column">
                        <div className="form-group">
                            <label>Tên mẫu tài liệu *</label>
                            <input
                                type="text"
                                name="documentTemplate"
                                value={formData.documentTemplate}
                                onChange={handleInputChange}
                                placeholder="Chọn mẫu tài liệu"
                            />
                        </div>
                        <div className="template-link">
                            <span>Bạn chưa có file mẫu?</span>
                            <a href="#" className="download-link">Tải file mẫu</a>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="form-group">
                            <label>Đẩy file tài liệu lên Bộ Công thương</label>
                            <div className="dropdown-container">
                                <select
                                    name="uploadToMinistry"
                                    value={formData.uploadToMinistry}
                                    onChange={handleInputChange}
                                >
                                    <option value="Không">Không</option>
                                    <option value="Có">Có</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="file-upload-area">
                    <div className="upload-icon">📊</div>
                    <div className="upload-text">
                        Kéo thả hoặc tải lên file tài liệu <span className="highlight">Tại đây</span>
                    </div>
                    <div className="upload-support">Hỗ trợ file XLS, XLSX</div>
                    <input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleBatchFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload-batch"
                    />
                    <label htmlFor="file-upload-batch" className="file-upload-label">
                        {formData.batchFile || 'Chọn file'}
                    </label>
                </div>
            </div>
        );
    }

    // Single template document type
    if (documentType === 'single-template') {
        return (
            <div className="step-content">
                <div className="document-type-section">
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-no-template"
                                checked={documentType === 'single-no-template'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu đơn lẻ không theo mẫu</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-template"
                                checked={documentType === 'single-template'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu đơn lẻ theo mẫu</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="batch"
                                checked={documentType === 'batch'}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                            <span>Tài liệu theo lô</span>
                        </label>
                    </div>
                </div>

                <div className="form-content">
                    <div className="left-column">
                        <div className="form-group">
                            <label>Mẫu tài liệu *</label>
                            <input
                                type="text"
                                name="documentTemplate"
                                value={formData.documentTemplate}
                                onChange={handleInputChange}
                                placeholder="Chọn tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Số tài liệu</label>
                            <input
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleInputChange}
                                placeholder="Nhập số tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Loại tài liệu</label>
                            <input
                                type="text"
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleInputChange}
                                placeholder="Chọn loại tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày hết hạn ký *</label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    name="signingExpirationDate"
                                    value={formData.signingExpirationDate}
                                    onChange={handleInputChange}
                                    placeholder="20/11/2025"
                                />
                                <span className="calendar-icon">📅</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Lời nhắn</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="form-group">
                            <label>Tên tài liệu *</label>
                            <input
                                type="text"
                                name="documentName"
                                value={formData.documentName}
                                onChange={handleInputChange}
                                placeholder="Nhập tên tài liệu"
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
                                />
                                <span className="attachment-icon">📎</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tài liệu liên quan</label>
                            <input
                                type="text"
                                name="relatedDocuments"
                                value={formData.relatedDocuments}
                                onChange={handleInputChange}
                                placeholder="Chọn tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày hết hiệu lực tài liệu</label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                <span className="calendar-icon">📅</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: single-no-template
    return (
        <div className="step-content">
            <div className="document-type-section">
                <div className="radio-group">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="single-no-template"
                            checked={documentType === 'single-no-template'}
                            onChange={(e) => setDocumentType(e.target.value)}
                        />
                        <span>Tài liệu đơn lẻ không theo mẫu</span>
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="single-template"
                            checked={documentType === 'single-template'}
                            onChange={(e) => setDocumentType(e.target.value)}
                        />
                        <span>Tài liệu đơn lẻ theo mẫu</span>
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="batch"
                            checked={documentType === 'batch'}
                            onChange={(e) => setDocumentType(e.target.value)}
                        />
                        <span>Tài liệu theo lô</span>
                    </label>
                </div>
            </div>

            <div className="file-upload-area">
                <div className="upload-icon">⬆️</div>
                <div className="upload-text">
                    Kéo thả hoặc tải lên file tài liệu <span className="highlight">Tại đây</span>
                </div>
                <div className="upload-support">Hỗ trợ file docx, pdf</div>
                <input
                    type="file"
                    accept=".docx,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload-single"
                />
                <label htmlFor="file-upload-single" className="file-upload-label">
                    {formData.attachedFile || 'Chọn file'}
                </label>
            </div>

            <div className="form-content">
                <div className="left-column">
                    <div className="form-group">
                        <label>Tên tài liệu *</label>
                        <input
                            type="text"
                            name="documentName"
                            value={formData.documentName}
                            onChange={handleInputChange}
                            placeholder="Tên tài liệu"
                        />
                    </div>
                    <div className="form-group">
                        <label>Số tài liệu</label>
                        <input
                            type="text"
                            name="documentNumber"
                            value={formData.documentNumber}
                            onChange={handleInputChange}
                            placeholder="Số tài liệu"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tài liệu liên quan</label>
                        <div className="dropdown-container">
                            <input
                                type="text"
                                name="relatedDocuments"
                                value={formData.relatedDocuments}
                                onChange={handleInputChange}
                                placeholder="Tài liệu đã hoàn thành hoặc trong menu Quản lý thư mục"
                            />
                            <span className="dropdown-icon">▼</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Lời nhắn</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>
                    <div className="form-group">
                        <label>Ngày hết hiệu lực tài liệu</label>
                        <div className="date-input-container">
                            <input
                                type="text"
                                name="expirationDate"
                                value={formData.expirationDate}
                                onChange={handleInputChange}
                                placeholder=""
                            />
                            <span className="calendar-icon">📅</span>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="form-group">
                        <label>File đính kèm</label>
                        <div className="file-input-container">
                            <input
                                type="text"
                                name="attachedFile"
                                value={formData.attachedFile}
                                onChange={handleInputChange}
                                placeholder="Chọn file đính kèm (PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR, TXT, XLS, XLSX)"
                            />
                            <span className="attachment-icon">📎</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Loại tài liệu</label>
                        <div className="dropdown-container">
                            <input
                                type="text"
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleInputChange}
                                placeholder="Chọn loại tài liệu"
                            />
                            <span className="dropdown-icon">▼</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Ngày hết hạn ký *</label>
                        <div className="date-input-container">
                            <input
                                type="text"
                                name="signingExpirationDate"
                                value={formData.signingExpirationDate}
                                onChange={handleInputChange}
                                placeholder="20/11/2025"
                            />
                            <span className="calendar-icon">📅</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocumentTypeSelection;
