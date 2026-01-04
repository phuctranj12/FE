import React from 'react';
import '../../styles/documentConfirmation.css';

function TemplateConfirmation({ 
    formData, 
    setFormData,
    reviewers, 
    signers, 
    documentClerks, 
    loading = false,
    onBack, 
    onComplete, 
    onSaveDraft 
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

    const getDocumentTypeLabel = (typeId) => {
        switch (typeId) {
            case '1':
                return 'Tài liệu gốc';
            case '2':
                return 'Tài liệu khách hàng';
            case '3':
                return 'Tài liệu đính kèm';
            default:
                return 'Chưa chọn loại tài liệu';
        }
    };

    return (
        <div className="step-content">
            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Đang xử lý, vui lòng đợi...</div>
                </div>
            )}
            
            {/* Document Information Summary */}
            <div className="document-summary">
                <h3 className="summary-title">Thông tin mẫu tài liệu</h3>
                
                <div className="summary-section">
                    <div className="summary-item">
                        <label className="summary-label">Tên mẫu tài liệu</label>
                        <div className="summary-value">{formData.templateName || 'Chưa nhập tên mẫu tài liệu'}</div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Mã mẫu tài liệu</label>
                        <div className="summary-value">{formData.templateCode || 'Chưa nhập mã mẫu tài liệu'}</div>
                    </div>

                    <div className="summary-item">
                        <label className="summary-label">Loại tài liệu</label>
                        <div className="summary-value">{getDocumentTypeLabel(formData.documentType)}</div>
                    </div>

                    <div className="summary-item">
                        <label className="summary-label">Ngày bắt đầu hiệu lực</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                value={formatDateForInput(formData.startDate || '')}
                                readOnly
                                className="date-input-readonly"
                            />
                        </div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Ngày kết thúc hiệu lực</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                value={formatDateForInput(formData.endDate || '')}
                                readOnly
                                className="date-input-readonly"
                            />
                        </div>
                    </div>

                    <div className="summary-item">
                        <label className="summary-label">File đính kèm</label>
                        <div className="summary-value">{formData.attachedFile || 'Chưa có file đính kèm'}</div>
                    </div>
                </div>

                {/* Signing Parties */}
                <div className="summary-section">
                    <h4 className="section-title">Các bên ký</h4>
                    <div className="signing-parties">
                        <div className="party-item">
                            <span className="party-number">1</span>
                            <span className="party-name">{formData.organization || 'Trung tâm công nghệ thông tin MobiFone'}</span>
                        </div>
                    </div>
                </div>

                {/* Reviewers */}
                <div className="summary-section">
                    <h4 className="section-title">Người xem xét</h4>
                    <div className="people-list">
                        {reviewers.length > 0 ? (
                            reviewers.map((reviewer, index) => (
                                <div key={reviewer.id} className="person-item">
                                    <span className="person-number">{index + 1}</span>
                                    <span className="person-name">{reviewer.fullName}</span>
                                    <span className="person-email">({reviewer.email})</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Chưa có người xem xét</div>
                        )}
                    </div>
                </div>

                {/* Signers */}
                <div className="summary-section">
                    <h4 className="section-title">Người ký ({signers.length})</h4>
                    <div className="people-list">
                        {signers.map((signer, index) => (
                            <div key={signer.id} className="person-item">
                                <span className="person-number">{index + 1}</span>
                                <span className="person-name">{signer.fullName}</span>
                                <span className="person-email">({signer.email})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document Clerks */}
                <div className="summary-section">
                    <h4 className="section-title">Văn thư</h4>
                    <div className="people-list">
                        {documentClerks.length > 0 ? (
                            documentClerks.map((clerk, index) => (
                                <div key={clerk.id} className="person-item">
                                    <span className="person-number">{index + 1}</span>
                                    <span className="person-name">{clerk.fullName}</span>
                                    <span className="person-email">({clerk.email})</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Chưa có văn thư</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="step-footer">
                <button className="back-btn" onClick={onBack} disabled={loading}>
                    Quay lại
                </button>
                <div className="footer-right">
                    <button className="save-draft-btn" onClick={onSaveDraft} disabled={loading}>
                        Lưu nháp
                    </button>
                    <button 
                        className="complete-btn" 
                        onClick={onComplete}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Hoàn thành'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TemplateConfirmation;

