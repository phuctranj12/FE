import React, { useState } from 'react';
import '../../styles/documentConfirmation.css';

function DocumentConfirmation({ 
    documentType, 
    formData, 
    setFormData, 
    reviewers,
    signers,
    documentClerks,
    onBack, 
    onComplete, 
    onSaveDraft 
}) {
    const [expirationDate, setExpirationDate] = useState('2025-11-23');
    const [ccEmails, setCcEmails] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExpirationDateChange = (e) => {
        setExpirationDate(e.target.value);
        setFormData(prev => ({
            ...prev,
            expirationDate: e.target.value
        }));
    };

    const handleCcEmailsChange = (e) => {
        setCcEmails(e.target.value);
        setFormData(prev => ({
            ...prev,
            ccEmails: e.target.value
        }));
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDocumentTypeLabel = (type) => {
        switch (type) {
            case 'single-no-template':
                return 'Tài liệu đơn lẻ không theo mẫu';
            case 'single-template':
                return 'Tài liệu đơn lẻ theo mẫu';
            case 'batch':
                return 'Tài liệu theo lô';
            default:
                return 'Tài liệu đơn lẻ không theo mẫu';
        }
    };

    return (
        <div className="step-content">
            {/* Document Type Selection - Read Only */}
            <div className="document-type-section">
                <div className="radio-group readonly">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="single-no-template"
                            checked={documentType === 'single-no-template'}
                            readOnly
                        />
                        <span>Tài liệu đơn lẻ không theo mẫu</span>
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="single-template"
                            checked={documentType === 'single-template'}
                            readOnly
                        />
                        <span>Tài liệu đơn lẻ theo mẫu</span>
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="documentType"
                            value="batch"
                            checked={documentType === 'batch'}
                            readOnly
                        />
                        <span>Tài liệu theo lô</span>
                    </label>
                </div>
            </div>

            {/* Document Information Summary */}
            <div className="document-summary">
                <h3 className="summary-title">Thông tin tài liệu</h3>
                
                <div className="summary-section">
                    <div className="summary-item">
                        <label className="summary-label">Tên tài liệu</label>
                        <div className="summary-value">{formData.documentName || 'adsasd'}</div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Lời nhắn</label>
                        <div className="summary-value">{formData.message || ''}</div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Ngày hết hạn ký</label>
                        <div className="date-input-wrapper">
                            <input
                                type="date"
                                value={expirationDate}
                                onChange={handleExpirationDateChange}
                                className="date-input"
                            />
                            <span className="date-display">{formatDateForDisplay(expirationDate)}</span>
                        </div>
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

                {/* CC Emails */}
                <div className="summary-section">
                    <h4 className="section-title">CC Tài liệu tới</h4>
                    <div className="form-group">
                        <input
                            type="text"
                            value={ccEmails}
                            onChange={handleCcEmailsChange}
                            className="form-input"
                            placeholder="Nhập email, ngăn cách nhau bởi dấu ','"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="step-footer">
                <button className="back-btn" onClick={onBack}>
                    Quay lại
                </button>
                <div className="footer-right">
                    <button className="save-draft-btn" onClick={onSaveDraft}>
                        Lưu nháp
                    </button>
                    <button className="complete-btn" onClick={onComplete}>
                        Hoàn thành
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DocumentConfirmation;
