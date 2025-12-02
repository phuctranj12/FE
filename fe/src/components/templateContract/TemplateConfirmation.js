import React, { useState } from 'react';
import '../../styles/documentConfirmation.css';

function TemplateConfirmation({ 
    formData, 
    setFormData,
    reviewers, 
    signers, 
    documentClerks, 
    onBack, 
    onComplete, 
    onSaveDraft 
}) {
    const [endDate, setEndDate] = useState(formData.endDate || '2025-11-23');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
        setFormData(prev => ({
            ...prev,
            endDate: e.target.value
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

    const getDocumentTypeLabel = (typeId) => {
        switch (typeId) {
            case '1':
                return 'Tài liệu gốc';
            case '2':
                return 'Tài liệu khách hàng';
            case '3':
                return 'Tài liệu đính kèm';
            case '4':
                return 'Tài liệu hợp đồng theo lô';
            default:
                return 'Chưa chọn loại tài liệu';
        }
    };

    return (
        <div className="step-content">
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
                        <div className="summary-value">{formatDateForDisplay(formData.startDate) || 'Chưa chọn'}</div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Ngày kết thúc hiệu lực</label>
                        <div className="date-input-wrapper">
                            <input
                                type="date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                className="date-input"
                            />
                            <span className="date-display">{formatDateForDisplay(endDate)}</span>
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

export default TemplateConfirmation;

