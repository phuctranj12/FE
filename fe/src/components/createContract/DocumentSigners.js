import React, { useState, useEffect, useRef } from 'react';
import '../../styles/documentForm.css';

function DocumentSigners({ 
    documentType,
    formData,
    setFormData,
    reviewers,
    addReviewer,
    updateReviewer,
    removeReviewer,
    signers,
    addSigner,
    removeSigner,
    updateSigner,
    documentClerks,
    addDocumentClerk,
    updateDocumentClerk,
    removeDocumentClerk,
    handleOrganizationOrderingChange,
    suggestName
}) {
    // State for autocomplete suggestions
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const suggestionTimeoutRef = useRef(null);

    // Fetch name suggestions with debounce
    const fetchSuggestions = async (textSearch) => {
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        if (!textSearch || textSearch.trim().length < 2) {
            setNameSuggestions([]);
            return;
        }

        suggestionTimeoutRef.current = setTimeout(async () => {
            if (suggestName) {
                setSuggestionLoading(true);
                try {
                    const suggestions = await suggestName(textSearch);
                    setNameSuggestions(suggestions);
                } catch (err) {
                    console.error('Error fetching suggestions:', err);
                    setNameSuggestions([]);
                } finally {
                    setSuggestionLoading(false);
                }
            }
        }, 300); // 300ms debounce
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }
        };
    }, []);
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
                    <label className="ordering-label">
                        <div className="order-input-box small">
                            <input
                                type="number"
                                min="1"
                                value={formData.organizationOrdering ?? ''}
                                onChange={(e) => handleOrganizationOrderingChange(e.target.value)}
                            />
                        </div>
                        <span>Tổ chức của tôi *</span>
                    </label>
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
                {reviewers.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có người xem xét nào</p>
                    </div>
                ) : (
                    reviewers.map((reviewer, index) => (
                        <div key={reviewer.id} className="participant-card">
                            <div className="participant-header">
                                <div className="title-with-order">
                                    <div className="order-input-box tiny">
                                        <input
                                            type="number"
                                            min="1"
                                            value={reviewer.ordering ?? ''}
                                            onChange={(e) => updateReviewer(reviewer.id, 'ordering', e.target.value)}
                                        />
                                    </div>
                                    <h4>Người xem xét {index + 1}</h4>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeReviewer(reviewer.id)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="participant-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ tên *</label>
                                        <input
                                            type="text"
                                            list={`name-suggestions-${reviewer.id}`}
                                            value={reviewer.fullName}
                                            onChange={(e) => {
                                                updateReviewer(reviewer.id, 'fullName', e.target.value);
                                                fetchSuggestions(e.target.value);
                                            }}
                                            placeholder="Nhập họ và tên"
                                        />
                                        <datalist id={`name-suggestions-${reviewer.id}`}>
                                            {nameSuggestions.map((suggestion, idx) => (
                                                <option key={idx} value={suggestion} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={reviewer.email}
                                            onChange={(e) => updateReviewer(reviewer.id, 'email', e.target.value)}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={reviewer.phone || ''}
                                            onChange={(e) => updateReviewer(reviewer.id, 'phone', e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CMND/CCCD</label>
                                        <input
                                            type="text"
                                            value={reviewer.card_id || reviewer.cardId || ''}
                                            onChange={(e) => updateReviewer(reviewer.id, 'card_id', e.target.value)}
                                            placeholder="Nhập số CMND/CCCD"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
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
                            <div className="title-with-order">
                                <div className="order-input-box tiny">
                                    <input
                                        type="number"
                                        min="1"
                                        value={signer.ordering ?? ''}
                                        onChange={(e) => updateSigner(signer.id, 'ordering', e.target.value)}
                                    />
                                </div>
                                <h4>Người ký {index + 1}</h4>
                            </div>
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
                                        list={`name-suggestions-${signer.id}`}
                                        value={signer.fullName}
                                        onChange={(e) => {
                                            updateSigner(signer.id, 'fullName', e.target.value);
                                            fetchSuggestions(e.target.value);
                                        }}
                                        placeholder="Nhập họ và tên"
                                    />
                                    <datalist id={`name-suggestions-${signer.id}`}>
                                        {nameSuggestions.map((suggestion, idx) => (
                                            <option key={idx} value={suggestion} />
                                        ))}
                                    </datalist>
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
                                    <label>{signer.loginByPhone ? 'Số điện thoại *' : 'Email *'}</label>
                                    {signer.loginByPhone ? (
                                        <input
                                            type="tel"
                                            value={signer.phone || ''}
                                            onChange={(e) => updateSigner(signer.id, 'phone', e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <input
                                            type="email"
                                            value={signer.email}
                                            onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                                            placeholder="Nhập email"
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Loại ký *</label>
                                    <input
                                        type="text"
                                        value="Ký bằng chứng thư số server"
                                        readOnly
                                        className="readonly-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>CMND/CCCD</label>
                                    <input
                                        type="text"
                                        value={signer.card_id || signer.cardId || ''}
                                        onChange={(e) => updateSigner(signer.id, 'card_id', e.target.value)}
                                        placeholder="Nhập số CMND/CCCD"
                                    />
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
                {documentClerks.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có văn thư nào</p>
                    </div>
                ) : (
                    documentClerks.map((clerk, index) => (
                        <div key={clerk.id} className="participant-card">
                            <div className="participant-header">
                                <div className="title-with-order">
                                    <div className="order-input-box tiny">
                                        <input
                                            type="number"
                                            min="1"
                                            value={clerk.ordering ?? ''}
                                            onChange={(e) => updateDocumentClerk(clerk.id, 'ordering', e.target.value)}
                                        />
                                    </div>
                                    <h4>Văn thư {index + 1}</h4>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeDocumentClerk(clerk.id)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="participant-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ tên *</label>
                                        <input
                                            type="text"
                                            list={`name-suggestions-${clerk.id}`}
                                            value={clerk.fullName}
                                            onChange={(e) => {
                                                updateDocumentClerk(clerk.id, 'fullName', e.target.value);
                                                fetchSuggestions(e.target.value);
                                            }}
                                            placeholder="Nhập họ và tên"
                                        />
                                        <datalist id={`name-suggestions-${clerk.id}`}>
                                            {nameSuggestions.map((suggestion, idx) => (
                                                <option key={idx} value={suggestion} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={clerk.email}
                                            onChange={(e) => updateDocumentClerk(clerk.id, 'email', e.target.value)}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={clerk.phone || ''}
                                            onChange={(e) => updateDocumentClerk(clerk.id, 'phone', e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CMND/CCCD</label>
                                        <input
                                            type="text"
                                            value={clerk.card_id || clerk.cardId || ''}
                                            onChange={(e) => updateDocumentClerk(clerk.id, 'card_id', e.target.value)}
                                            placeholder="Nhập số CMND/CCCD"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DocumentSigners;
