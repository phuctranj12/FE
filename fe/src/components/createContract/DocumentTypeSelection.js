import React from 'react';
import '../../styles/documentForm.css';

function DocumentTypeSelection({ 
    documentType, 
    setDocumentType, 
    formData, 
    handleInputChange, 
    handleFileUpload, 
    handleBatchFileUpload,
    documentTypes = [],
    relatedContracts = [],
    loading = false,
    handleDocumentNumberBlur = () => {},
    isCheckingDocumentNumber = false,
    isDocumentNumberValid = true,
    handleAttachedFilesUpload = () => {},
    removeAttachedFile = () => {}
}) {
    const formatDateForInput = (value) => {
        if (!value) return '';
        if (value.includes('T')) {
            return value.substring(0, 10);
        }
        if (value.includes('/')) {
            const [day, month, year] = value.split('/');
            if (day && month && year) {
                return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        return value;
    };

    const handleDateChange = (event) => {
        const { name, value } = event.target;
        const formatted = value ? value.split('-').reverse().join('/') : '';
        handleInputChange({ target: { name, value: formatted } });
    };

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
                            <label>Tên mẫu tài liệu <span style={{ color: 'red' }}>*</span></label>
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
                            <label>Mẫu tài liệu <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                name="documentTemplate"
                                value={formData.documentTemplate}
                                onChange={handleInputChange}
                                placeholder="Chọn tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Số tài liệu <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleInputChange}
                                onBlur={handleDocumentNumberBlur}
                                placeholder="Nhập số tài liệu"
                                required
                                style={{
                                    borderColor: !isDocumentNumberValid ? '#f44336' : undefined
                                }}
                                disabled={isCheckingDocumentNumber}
                            />
                            {isCheckingDocumentNumber && (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    Đang kiểm tra...
                                </div>
                            )}
                            {!isDocumentNumberValid && (
                                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                                    ❌ Mã hợp đồng đã tồn tại
                                </div>
                            )}
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
                            <label>Ngày hết hạn ký <span style={{ color: 'red' }}>*</span></label>
                            <div className="date-input-container">
                                <input
                                    type="date"
                                    name="signingExpirationDate"
                                    value={formatDateForInput(formData.signingExpirationDate)}
                                    onChange={handleDateChange}
                                />
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
                            <label>Tên tài liệu <span style={{ color: 'red' }}>*</span></label>
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
                            <label>Ngày hết hiệu lực tài liệu <span style={{ color: 'red' }}>*</span></label>
                            <div className="date-input-container">
                                <input
                                    type="date"
                                    name="expirationDate"
                                    value={formatDateForInput(formData.expirationDate)}
                                    onChange={handleDateChange}
                                />
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
                    accept=".pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload-single"
                    disabled={loading}
                />
                <label htmlFor="file-upload-single" className={`file-upload-label ${loading ? 'disabled' : ''}`}>
                    {loading ? 'Đang xử lý...' : (formData.pdfFileName || formData.attachedFile || 'Chọn file PDF')}
                </label>
                {formData.pdfPageCount > 0 && (
                    <div className="file-info" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        ✅ File: {formData.pdfFileName} | Số trang: {formData.pdfPageCount}
                    </div>
                )}
            </div>

            <div className="form-content">
                <div className="left-column">
                    <div className="form-group">
                        <label>Tên tài liệu <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="documentName"
                            value={formData.documentName}
                            onChange={handleInputChange}
                            placeholder="Tên tài liệu"
                        />
                    </div>
                    <div className="form-group">
                        <label>Số tài liệu <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="documentNumber"
                            value={formData.documentNumber}
                            onChange={handleInputChange}
                            onBlur={handleDocumentNumberBlur}
                            placeholder="Số tài liệu"
                            required
                            style={{
                                borderColor: !isDocumentNumberValid ? '#f44336' : undefined
                            }}
                            disabled={isCheckingDocumentNumber}
                        />
                        {isCheckingDocumentNumber && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Đang kiểm tra...
                            </div>
                        )}
                        {!isDocumentNumberValid && (
                            <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                                ❌ Mã hợp đồng đã tồn tại
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Tài liệu liên quan</label>
                        <div className="dropdown-container">
                            <select
                                name="relatedDocuments"
                                value={formData.relatedDocuments}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="">-- Chọn tài liệu liên quan --</option>
                                {relatedContracts.map((contract) => (
                                    <option key={contract.id} value={contract.id}>
                                        {contract.name}
                                    </option>
                                ))}
                            </select>
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
                </div>

                <div className="right-column">
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
                                disabled={loading}
                            />
                            <label 
                                htmlFor="attached-files-upload" 
                                className={`attach-file-upload-label ${loading ? 'disabled' : ''}`}
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
                        <label>Loại tài liệu</label>
                        <div className="dropdown-container">
                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="">-- Chọn loại tài liệu --</option>
                                {documentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            <span className="dropdown-icon">▼</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Ngày hết hạn ký <span style={{ color: 'red' }}>*</span></label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                name="signingExpirationDate"
                                value={formatDateForInput(formData.signingExpirationDate)}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Ngày hết hiệu lực tài liệu <span style={{ color: 'red' }}>*</span></label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                name="expirationDate"
                                value={formatDateForInput(formData.expirationDate)}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocumentTypeSelection;
