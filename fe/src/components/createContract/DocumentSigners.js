import React from 'react';
import '../../styles/documentForm.css';

function DocumentSigners({ 
    documentType,
    formData,
    setFormData,
    reviewers,
    addReviewer,
    signers,
    addSigner,
    removeSigner,
    updateSigner,
    documentClerks,
    addDocumentClerk
}) {
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
                <div className="workflow-checkbox">
                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={formData.printWorkflow}
                            onChange={(e) => setFormData(prev => ({...prev, printWorkflow: e.target.checked}))}
                        />
                        <span>Ấn luồng xử lý</span>
                    </label>
                </div>
            </div>

            {/* Organization Info */}
            <div className="organization-section">
                <div className="form-group">
                    <label>1 Tổ chức của tôi *</label>
                    <input
                        type="text"
                        value={formData.organization}
                        readOnly
                        className="readonly-input"
                    />
                </div>
            </div>

            {/* Reviewers Section */}
            <div className="reviewers-section">
                <div className="section-header">
                    <h3>Người xem xét</h3>
                    <button className="add-btn" onClick={addReviewer}>
                        <span>+</span> Thêm người xem xét
                    </button>
                </div>
                {reviewers.length === 0 && (
                    <div className="empty-state">
                        <p>Chưa có người xem xét nào</p>
                    </div>
                )}
            </div>

            {/* Signers Section */}
            <div className="signers-section">
                <div className="section-header">
                    <h3>Người ký ({signers.length})</h3>
                </div>
                {signers.map((signer, index) => (
                    <div key={signer.id} className="signer-card">
                        <div className="signer-header">
                            <h4>{index + 1} Người ký {index + 1}</h4>
                            {signers.length > 1 && (
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeSigner(signer.id)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="signer-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ tên *</label>
                                    <input
                                        type="text"
                                        value={signer.fullName}
                                        onChange={(e) => updateSigner(signer.id, 'fullName', e.target.value)}
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            checked={signer.loginByPhone}
                                            onChange={(e) => updateSigner(signer.id, 'loginByPhone', e.target.checked)}
                                        />
                                        <span>Đăng nhập bằng số điện thoại</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={signer.email}
                                        onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                                        placeholder="Nhập email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại ký *</label>
                                    <select
                                        value={signer.signType}
                                        onChange={(e) => updateSigner(signer.id, 'signType', e.target.value)}
                                    >
                                        <option value="">Chọn</option>
                                        <option value="ky-so">Ký số</option>
                                        <option value="ky-tay">Ký tay</option>
                                        <option value="ky-dien-tu">Ký điện tử</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <button className="add-btn" onClick={addSigner}>
                    <span>+</span> Thêm người ký
                </button>
            </div>

            {/* Document Clerks Section */}
            <div className="clerks-section">
                <div className="section-header">
                    <h3>Văn thư</h3>
                    <button className="add-btn" onClick={addDocumentClerk}>
                        <span>+</span> Thêm văn thư
                    </button>
                </div>
                <div className="clerk-actions">
                    <a href="#" className="add-partner-link">Thêm đối tác</a>
                </div>
                {documentClerks.length === 0 && (
                    <div className="empty-state">
                        <p>Chưa có văn thư nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentSigners;
