import React, { useState } from 'react';
import '../../styles/documentConfirmation.css';
import PDFViewer from '../document/PDFViewer';

function DocumentConfirmation({ 
    documentType, 
    formData, 
    setFormData, 
    reviewers,
    signers,
    documentClerks,
    coordinators = [],
    partnerParticipants = [],
    contractId,
    documentId,
    fieldsData = [],
    loading = false,
    onBack, 
    onComplete, 
    onSaveDraft 
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(15);
    const [zoom, setZoom] = useState(100);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const getDocumentTypeLabel = (type) => {
        switch (type) {
            case 'single-no-template':
                return 'Tài liệu đơn lẻ không theo mẫu';
            case 'single-template':
                return 'Tài liệu đơn lẻ theo mẫu';
            default:
                return 'Tài liệu đơn lẻ không theo mẫu';
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
                </div>
            </div>

            {/* Document Information Summary */}
            <div className="document-summary">
                <h3 className="summary-title">Thông tin tài liệu</h3>
                
                <div className="summary-section">
                    <div className="summary-item">
                        <label className="summary-label">Tên tài liệu</label>
                        <div className="date-input-container">
                            <div className="summary-value-readonly">{formData.documentName || 'adsasd'}</div>
                        </div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Lời nhắn</label>
                        <div className="date-input-container">
                            <div className="summary-value-readonly">{formData.message || ''}</div>
                        </div>
                    </div>
                    
                    <div className="summary-item">
                        <label className="summary-label">Ngày hết hạn ký</label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                value={formatDateForInput(formData.signingExpirationDate || '')}
                                readOnly
                                className="date-input-readonly"
                            />
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
                        {partnerParticipants.map((partner, index) => (
                            <div key={partner.id} className="party-item">
                                <span className="party-number">{index + 2}</span>
                                <span className="party-name">{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coordinators */}
                <div className="summary-section">
                    <h4 className="section-title">Người điều phối</h4>
                    <div className="people-list">
                        {coordinators.length > 0 ? (
                            coordinators.map((coordinator, index) => (
                                <div key={coordinator.id} className="person-item">
                                    <span className="person-number">{index + 1}</span>
                                    <span className="person-name">{coordinator.fullName}</span>
                                    <span className="person-email">({coordinator.email})</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Chưa có người điều phối</div>
                        )}
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

                {/* Partner Information */}
                {partnerParticipants.map((partner, partnerIndex) => (
                    <div key={partner.id} className="summary-section partner-section">
                        <h4 className="section-title">{partner.name}</h4>
                        
                        {/* Partner Coordinators */}
                        {partner.coordinators.length > 0 && (
                            <div className="subsection">
                                <h5 className="subsection-title">Người điều phối</h5>
                                <div className="people-list">
                                    {partner.coordinators.map((coordinator, index) => (
                                        <div key={coordinator.id} className="person-item">
                                            <span className="person-number">{index + 1}</span>
                                            <span className="person-name">{coordinator.fullName}</span>
                                            <span className="person-email">({coordinator.email})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Reviewers */}
                        {partner.reviewers.length > 0 && (
                            <div className="subsection">
                                <h5 className="subsection-title">Người xem xét</h5>
                                <div className="people-list">
                                    {partner.reviewers.map((reviewer, index) => (
                                        <div key={reviewer.id} className="person-item">
                                            <span className="person-number">{index + 1}</span>
                                            <span className="person-name">{reviewer.fullName}</span>
                                            <span className="person-email">({reviewer.email})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Signers */}
                        {partner.signers.length > 0 && (
                            <div className="subsection">
                                <h5 className="subsection-title">Người ký ({partner.signers.length})</h5>
                                <div className="people-list">
                                    {partner.signers.map((signer, index) => (
                                        <div key={signer.id} className="person-item">
                                            <span className="person-number">{index + 1}</span>
                                            <span className="person-name">{signer.fullName}</span>
                                            <span className="person-email">({signer.email})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Clerks */}
                        {partner.clerks.length > 0 && (
                            <div className="subsection">
                                <h5 className="subsection-title">Văn thư</h5>
                                <div className="people-list">
                                    {partner.clerks.map((clerk, index) => (
                                        <div key={clerk.id} className="person-item">
                                            <span className="person-number">{index + 1}</span>
                                            <span className="person-name">{clerk.fullName}</span>
                                            <span className="person-email">({clerk.email})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

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
                        disabled={loading || !contractId || !documentId || !fieldsData || fieldsData.length === 0}
                    >
                        {loading ? 'Đang xử lý...' : 'Hoàn thành'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DocumentConfirmation;
