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
    contractId,
    documentId,
    fieldsData = [],
    loading = false,
    onBack, 
    onComplete, 
    onSaveDraft 
}) {
    const [expirationDate, setExpirationDate] = useState('2025-11-23');
    const [currentBatchDoc, setCurrentBatchDoc] = useState(1);
    const totalBatchDocs = 1; // Mock data
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

    const handleExpirationDateChange = (e) => {
        setExpirationDate(e.target.value);
        setFormData(prev => ({
            ...prev,
            expirationDate: e.target.value
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

    // Render batch document UI
    if (documentType === 'batch') {
        return (
            <div className="batch-confirmation-container">
                <div className="batch-sidebar">
                    <div className="batch-doc-navigation">
                        <h3>SỐ TÀI LIỆU THEO LÔ</h3>
                        <div className="batch-nav-controls">
                            <button 
                                onClick={() => setCurrentBatchDoc(prev => Math.max(1, prev - 1))}
                                disabled={currentBatchDoc === 1}
                            >
                                ‹
                            </button>
                            <input 
                                type="number" 
                                value={currentBatchDoc} 
                                readOnly
                                style={{ width: '50px', textAlign: 'center' }}
                            />
                            <span> / {totalBatchDocs}</span>
                            <button 
                                onClick={() => setCurrentBatchDoc(prev => Math.min(totalBatchDocs, prev + 1))}
                                disabled={currentBatchDoc === totalBatchDocs}
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    <div className="batch-signers-info">
                        <h3>THÔNG TIN CÁC BÊN KÝ</h3>
                        
                        <div className="signer-group">
                            <h4>TỔ CHỨC CỦA TÔI</h4>
                            <div className="signer-list">
                                {signers.filter(s => s.role === 'my-org').map((signer, idx) => (
                                    <div key={signer.id} className="signer-item">
                                        <div className="signer-label">Người ký:</div>
                                        <div className="signer-name">{signer.fullName || 'Nguyễn Quang Minh'}</div>
                                        <div className="signer-email">({signer.email || 'minhseven2002@gmail.com'})</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="signer-group">
                            <h4>NGƯỜI ĐƯỢC CC</h4>
                            <div className="signer-list">
                                {reviewers.length > 0 ? reviewers.map((reviewer, idx) => (
                                    <div key={reviewer.id} className="signer-item">
                                        <div className="signer-label">Người ký:</div>
                                        <div className="signer-name">{reviewer.fullName}</div>
                                        <div className="signer-email">({reviewer.email})</div>
                                    </div>
                                )) : (
                                    <div className="empty-signer">Chưa có người được CC</div>
                                )}
                            </div>
                        </div>

                        <div className="signer-group">
                            <h4>Đối tác 1</h4>
                            <div className="signer-list">
                                {signers.filter(s => s.role !== 'my-org').map((signer, idx) => (
                                    <div key={signer.id} className="signer-item">
                                        <div className="signer-label">Người ký:</div>
                                        <div className="signer-name">{signer.fullName || 'Người ký 1'}</div>
                                        <div className="signer-email">({signer.email || 'minh@gmail.com'})</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="batch-actions">
                        <button className="back-btn" onClick={onBack} disabled={loading}>
                            Quay lại
                        </button>
                        <div className="right-actions">
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

                <div className="batch-pdf-viewer">
                    <div className="pdf-controls">
                        <div className="pagination-controls">
                            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>««</button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>«</button>
                            <span>{currentPage} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>»</button>
                            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>»»</button>
                        </div>
                        <div className="zoom-controls">
                            <select value={zoom} onChange={(e) => handleZoomChange(Number(e.target.value))}>
                                <option value={50}>50%</option>
                                <option value={75}>75%</option>
                                <option value={100}>100%</option>
                                <option value={125}>125%</option>
                                <option value={150}>150%</option>
                                <option value={200}>200%</option>
                            </select>
                        </div>
                    </div>
                    <div className="pdf-viewer-wrapper">
                        <PDFViewer 
                            document={{}}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            zoom={zoom}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        );
    }

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
