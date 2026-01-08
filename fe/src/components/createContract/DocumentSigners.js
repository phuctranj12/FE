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
    suggestName,
    partners,
    addPartner,
    removePartner,
    updatePartner,
    addPartnerCoordinator,
    updatePartnerCoordinator,
    removePartnerCoordinator,
    addPartnerReviewer,
    updatePartnerReviewer,
    removePartnerReviewer,
    addPartnerSigner,
    updatePartnerSigner,
    removePartnerSigner,
    addPartnerClerk,
    updatePartnerClerk,
    removePartnerClerk
}) {
    // State for autocomplete suggestions
    const [nameSuggestions, setNameSuggestions] = useState([]); // Array of { name, email }
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentInputId, setCurrentInputId] = useState(null); // Track which input is active
    const suggestionTimeoutRef = useRef(null);

    // Fetch name suggestions with debounce
    const fetchSuggestions = async (textSearch, inputId) => {
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        // Gọi API ngay cả khi textSearch rỗng hoặc < 2 ký tự
        suggestionTimeoutRef.current = setTimeout(async () => {
            if (suggestName) {
                setSuggestionLoading(true);
                try {
                    // Gọi API với textSearch (có thể rỗng hoặc < 2 ký tự)
                    const searchText = textSearch?.trim() || '';
                    const suggestions = await suggestName(searchText);
                    setNameSuggestions(suggestions);
                    setShowSuggestions(suggestions.length > 0);
                    setCurrentInputId(inputId);
                } catch (err) {
                    console.error('Error fetching suggestions:', err);
                    setNameSuggestions([]);
                    setShowSuggestions(false);
                } finally {
                    setSuggestionLoading(false);
                }
            }
        }, 300); // 300ms debounce
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion, itemId, field, partnerId = null) => {
        if (field === 'signer') {
            updateSigner(itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updateSigner(itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updateSigner(itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'reviewer') {
            updateReviewer(itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updateReviewer(itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updateReviewer(itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'clerk') {
            updateDocumentClerk(itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updateDocumentClerk(itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updateDocumentClerk(itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'partner-coordinator' && partnerId) {
            updatePartnerCoordinator(partnerId, itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updatePartnerCoordinator(partnerId, itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updatePartnerCoordinator(partnerId, itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'partner-reviewer' && partnerId) {
            updatePartnerReviewer(partnerId, itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updatePartnerReviewer(partnerId, itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updatePartnerReviewer(partnerId, itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'partner-signer' && partnerId) {
            updatePartnerSigner(partnerId, itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updatePartnerSigner(partnerId, itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updatePartnerSigner(partnerId, itemId, 'phone', suggestion.phone);
            }
        } else if (field === 'partner-clerk' && partnerId) {
            updatePartnerClerk(partnerId, itemId, 'fullName', suggestion.name);
            if (suggestion.email) {
                updatePartnerClerk(partnerId, itemId, 'email', suggestion.email);
            }
            if (suggestion.phone) {
                updatePartnerClerk(partnerId, itemId, 'phone', suggestion.phone);
            }
        }
        setNameSuggestions([]);
        setShowSuggestions(false);
        setCurrentInputId(null);
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
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="text"
                                            value={reviewer.fullName}
                                            onChange={(e) => {
                                                updateReviewer(reviewer.id, 'fullName', e.target.value);
                                                fetchSuggestions(e.target.value, `reviewer-${reviewer.id}`);
                                            }}
                                            onFocus={() => {
                                                if (nameSuggestions.length > 0) {
                                                    setShowSuggestions(true);
                                                    setCurrentInputId(`reviewer-${reviewer.id}`);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                setTimeout(() => {
                                                    setShowSuggestions(false);
                                                    setCurrentInputId(null);
                                                }, 200);
                                            }}
                                            placeholder="Nhập họ và tên"
                                        />
                                        {showSuggestions && currentInputId === `reviewer-${reviewer.id}` && nameSuggestions.length > 0 && (
                                            <div className="suggestion-dropdown" style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                marginTop: '4px'
                                            }}>
                                                {nameSuggestions.map((suggestion, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSuggestionSelect(suggestion, reviewer.id, 'reviewer')}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.backgroundColor = '#f5f5f5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                        {suggestion.email && (
                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                {suggestion.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Email <span style={{ color: 'red' }}>*</span></label>
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
                    <button className="add-btn" onClick={addSigner}>
                        <span>+</span> Thêm người ký
                    </button>
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
                            <button
                                className="remove-btn"
                                onClick={() => removeSigner(signer.id)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="signer-form">
                            <div className="form-row">
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={signer.fullName}
                                        onChange={(e) => {
                                            updateSigner(signer.id, 'fullName', e.target.value);
                                            fetchSuggestions(e.target.value, `signer-${signer.id}`);
                                        }}
                                        onFocus={() => {
                                            if (nameSuggestions.length > 0) {
                                                setShowSuggestions(true);
                                                setCurrentInputId(`signer-${signer.id}`);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => {
                                                setShowSuggestions(false);
                                                setCurrentInputId(null);
                                            }, 200);
                                        }}
                                        placeholder="Nhập họ và tên"
                                    />
                                    {showSuggestions && currentInputId === `signer-${signer.id}` && nameSuggestions.length > 0 && (
                                        <div className="suggestion-dropdown" style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            marginTop: '4px'
                                        }}>
                                            {nameSuggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSuggestionSelect(suggestion, signer.id, 'signer')}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#f5f5f5';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                    {suggestion.email && (
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                            📧 {suggestion.email}
                                                        </div>
                                                    )}
                                                    {suggestion.phone && (
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                            📱 {suggestion.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Email <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="email"
                                        value={signer.email}
                                        onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                                        placeholder="Nhập email"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={signer.phone || ''}
                                        onChange={(e) => updateSigner(signer.id, 'phone', e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
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
                                    <label>Mã số thuế/CMT/CCCD <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={signer.card_id || signer.cardId || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            updateSigner(signer.id, 'card_id', value);
                                            updateSigner(signer.id, 'cardId', value);
                                        }}
                                        placeholder="Nhập Mã số thuế/CMT/CCCD"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Clerks Section */}
            <div className="clerks-section">
                <div className="section-header">
                    <h3>Văn thư</h3>
                    <button className="add-btn" onClick={addDocumentClerk}>
                        <span>+</span> Thêm văn thư
                    </button>
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
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="text"
                                            value={clerk.fullName}
                                            onChange={(e) => {
                                                updateDocumentClerk(clerk.id, 'fullName', e.target.value);
                                                fetchSuggestions(e.target.value, `clerk-${clerk.id}`);
                                            }}
                                            onFocus={() => {
                                                if (nameSuggestions.length > 0) {
                                                    setShowSuggestions(true);
                                                    setCurrentInputId(`clerk-${clerk.id}`);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                setTimeout(() => {
                                                    setShowSuggestions(false);
                                                    setCurrentInputId(null);
                                                }, 200);
                                            }}
                                            placeholder="Nhập họ và tên"
                                        />
                                        {showSuggestions && currentInputId === `clerk-${clerk.id}` && nameSuggestions.length > 0 && (
                                            <div className="suggestion-dropdown" style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                marginTop: '4px'
                                            }}>
                                                {nameSuggestions.map((suggestion, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSuggestionSelect(suggestion, clerk.id, 'clerk')}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.backgroundColor = '#f5f5f5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                        {suggestion.email && (
                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                {suggestion.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Email <span style={{ color: 'red' }}>*</span></label>
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
                                        <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
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
                                        <label>Mã số thuế/CMT/CCCD <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="text"
                                            value={clerk.card_id || clerk.cardId || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateDocumentClerk(clerk.id, 'card_id', value);
                                                updateDocumentClerk(clerk.id, 'cardId', value);
                                            }}
                                            placeholder="Nhập Mã số thuế/CMT/CCCD"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Partners Section */}
            <div className="partners-section">
                <div className="section-header">
                    <h3>Đối tác</h3>
                    <button className="add-btn" onClick={addPartner}>
                        <span>+</span> Thêm đối tác
                    </button>
                </div>
                {partners.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có đối tác nào</p>
                    </div>
                ) : (
                    partners.map((partner, partnerIndex) => (
                        <div key={partner.id} className="organization-section">
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="ordering-label">
                                            <div className="order-input-box small">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={partner.ordering ?? ''}
                                                    onChange={(e) => updatePartner(partner.id, 'ordering', e.target.value)}
                                                />
                                            </div>
                                            <span>Đối tác {partnerIndex + 1} *</span>
                                        </label>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <label className="radio-option" style={{ margin: 0 }}>
                                                    <input
                                                        type="radio"
                                                        checked={partner.type === 2}
                                                        onChange={() => {
                                                            updatePartner(partner.id, 'type', 2);
                                                        }}
                                                    />
                                                    <span>Tổ chức</span>
                                                </label>
                                                <label className="radio-option" style={{ margin: 0 }}>
                                                    <input
                                                        type="radio"
                                                        checked={partner.type === 3}
                                                        onChange={() => updatePartner(partner.id, 'type', 3)}
                                                    />
                                                    <span>Cá nhân</span>
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={partner.name}
                                                onChange={(e) => updatePartner(partner.id, 'name', e.target.value)}
                                                placeholder={partner.type === 2 ? "Tên tổ chức" : "Tên cá nhân"}
                                                style={{ flex: 1, minWidth: '200px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removePartner(partner.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Coordinators Section - Only for Organization */}
                            {partner.type === 2 && (
                                <div className="coordinators-section" style={{ marginBottom: '20px' }}>
                                    <div className="section-header">
                                        <h4>Người điều phối</h4>
                                        <button className="add-btn" onClick={() => addPartnerCoordinator(partner.id)}>
                                            <span>+</span> Thêm người điều phối
                                        </button>
                                    </div>
                                    {partner.coordinators.length === 0 ? (
                                        <div className="empty-state">
                                            <p>Chưa có người điều phối nào</p>
                                        </div>
                                    ) : (
                                        partner.coordinators.map((coordinator, index) => (
                                            <div key={coordinator.id} className="participant-card">
                                                <div className="participant-header">
                                                    <div className="title-with-order">
                                                        <div className="order-input-box tiny">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={coordinator.ordering ?? ''}
                                                                onChange={(e) => updatePartnerCoordinator(partner.id, coordinator.id, 'ordering', e.target.value)}
                                                            />
                                                        </div>
                                                        <h4>Người điều phối {index + 1}</h4>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removePartnerCoordinator(partner.id, coordinator.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="participant-form">
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ position: 'relative' }}>
                                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                value={coordinator.fullName}
                                                                onChange={(e) => {
                                                                    updatePartnerCoordinator(partner.id, coordinator.id, 'fullName', e.target.value);
                                                                    fetchSuggestions(e.target.value, `partner-coordinator-${partner.id}-${coordinator.id}`);
                                                                }}
                                                                onFocus={() => {
                                                                    if (nameSuggestions.length > 0) {
                                                                        setShowSuggestions(true);
                                                                        setCurrentInputId(`partner-coordinator-${partner.id}-${coordinator.id}`);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    setTimeout(() => {
                                                                        setShowSuggestions(false);
                                                                        setCurrentInputId(null);
                                                                    }, 200);
                                                                }}
                                                                placeholder="Nhập họ và tên"
                                                            />
                                                            {showSuggestions && currentInputId === `partner-coordinator-${partner.id}-${coordinator.id}` && nameSuggestions.length > 0 && (
                                                                <div className="suggestion-dropdown" style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    right: 0,
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    maxHeight: '200px',
                                                                    overflowY: 'auto',
                                                                    zIndex: 1000,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    {nameSuggestions.map((suggestion, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => handleSuggestionSelect(suggestion, coordinator.id, 'partner-coordinator', partner.id)}
                                                                            style={{
                                                                                padding: '8px 12px',
                                                                                cursor: 'pointer',
                                                                                borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.backgroundColor = '#f5f5f5';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.backgroundColor = 'white';
                                                                            }}
                                                                        >
                                                                            <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                                            {suggestion.email && (
                                                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                                    {suggestion.email}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="email"
                                                                value={coordinator.email}
                                                                onChange={(e) => updatePartnerCoordinator(partner.id, coordinator.id, 'email', e.target.value)}
                                                                placeholder="Nhập email"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>Số điện thoại</label>
                                                            <input
                                                                type="text"
                                                                value={coordinator.phone || ''}
                                                                onChange={(e) => updatePartnerCoordinator(partner.id, coordinator.id, 'phone', e.target.value)}
                                                                placeholder="Nhập số điện thoại"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Reviewers Section - Only for Organization */}
                            {partner.type === 2 && (
                                <div className="reviewers-section" style={{ marginBottom: '20px' }}>
                                    <div className="section-header">
                                        <h4>Người xem xét</h4>
                                        <button className="add-btn" onClick={() => addPartnerReviewer(partner.id)}>
                                            <span>+</span> Thêm người xem xét
                                        </button>
                                    </div>
                                    {partner.reviewers.length === 0 ? (
                                        <div className="empty-state">
                                            <p>Chưa có người xem xét nào</p>
                                        </div>
                                    ) : (
                                        partner.reviewers.map((reviewer, index) => (
                                            <div key={reviewer.id} className="participant-card">
                                                <div className="participant-header">
                                                    <div className="title-with-order">
                                                        <div className="order-input-box tiny">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={reviewer.ordering ?? ''}
                                                                onChange={(e) => updatePartnerReviewer(partner.id, reviewer.id, 'ordering', e.target.value)}
                                                            />
                                                        </div>
                                                        <h4>Người xem xét {index + 1}</h4>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removePartnerReviewer(partner.id, reviewer.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="participant-form">
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ position: 'relative' }}>
                                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                value={reviewer.fullName}
                                                                onChange={(e) => {
                                                                    updatePartnerReviewer(partner.id, reviewer.id, 'fullName', e.target.value);
                                                                    fetchSuggestions(e.target.value, `partner-reviewer-${partner.id}-${reviewer.id}`);
                                                                }}
                                                                onFocus={() => {
                                                                    if (nameSuggestions.length > 0) {
                                                                        setShowSuggestions(true);
                                                                        setCurrentInputId(`partner-reviewer-${partner.id}-${reviewer.id}`);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    setTimeout(() => {
                                                                        setShowSuggestions(false);
                                                                        setCurrentInputId(null);
                                                                    }, 200);
                                                                }}
                                                                placeholder="Nhập họ và tên"
                                                            />
                                                            {showSuggestions && currentInputId === `partner-reviewer-${partner.id}-${reviewer.id}` && nameSuggestions.length > 0 && (
                                                                <div className="suggestion-dropdown" style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    right: 0,
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    maxHeight: '200px',
                                                                    overflowY: 'auto',
                                                                    zIndex: 1000,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    {nameSuggestions.map((suggestion, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => handleSuggestionSelect(suggestion, reviewer.id, 'partner-reviewer', partner.id)}
                                                                            style={{
                                                                                padding: '8px 12px',
                                                                                cursor: 'pointer',
                                                                                borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.backgroundColor = '#f5f5f5';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.backgroundColor = 'white';
                                                                            }}
                                                                        >
                                                                            <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                                            {suggestion.email && (
                                                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                                    {suggestion.email}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="email"
                                                                value={reviewer.email}
                                                                onChange={(e) => updatePartnerReviewer(partner.id, reviewer.id, 'email', e.target.value)}
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
                                                                onChange={(e) => updatePartnerReviewer(partner.id, reviewer.id, 'phone', e.target.value)}
                                                                placeholder="Nhập số điện thoại"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Signers Section - For both Organization and Individual */}
                            <div className="signers-section" style={{ marginBottom: '20px' }}>
                                <div className="section-header">
                                    <h4>Người ký ({partner.signers.length})</h4>
                                    <button className="add-btn" onClick={() => addPartnerSigner(partner.id)}>
                                        <span>+</span> Thêm người ký
                                    </button>
                                </div>
                                {partner.signers.length === 0 ? (
                                    <div className="empty-state">
                                        <p>Chưa có người ký nào</p>
                                    </div>
                                ) : (
                                    partner.signers.map((signer, index) => (
                                        <div key={signer.id} className="signer-card">
                                            <div className="signer-header">
                                                <div className="title-with-order">
                                                    <div className="order-input-box tiny">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={signer.ordering ?? ''}
                                                            onChange={(e) => updatePartnerSigner(partner.id, signer.id, 'ordering', e.target.value)}
                                                        />
                                                    </div>
                                                    <h4>Người ký {index + 1}</h4>
                                                </div>
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => removePartnerSigner(partner.id, signer.id)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="signer-form">
                                                <div className="form-row">
                                                    <div className="form-group" style={{ position: 'relative' }}>
                                                        <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                                        <input
                                                            type="text"
                                                            value={signer.fullName}
                                                            onChange={(e) => {
                                                                updatePartnerSigner(partner.id, signer.id, 'fullName', e.target.value);
                                                                fetchSuggestions(e.target.value, `partner-signer-${partner.id}-${signer.id}`);
                                                            }}
                                                            onFocus={() => {
                                                                if (nameSuggestions.length > 0) {
                                                                    setShowSuggestions(true);
                                                                    setCurrentInputId(`partner-signer-${partner.id}-${signer.id}`);
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                setTimeout(() => {
                                                                    setShowSuggestions(false);
                                                                    setCurrentInputId(null);
                                                                }, 200);
                                                            }}
                                                            placeholder="Nhập họ và tên"
                                                        />
                                                        {showSuggestions && currentInputId === `partner-signer-${partner.id}-${signer.id}` && nameSuggestions.length > 0 && (
                                                            <div className="suggestion-dropdown" style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                right: 0,
                                                                backgroundColor: 'white',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                maxHeight: '200px',
                                                                overflowY: 'auto',
                                                                zIndex: 1000,
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                marginTop: '4px'
                                                            }}>
                                                                {nameSuggestions.map((suggestion, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => handleSuggestionSelect(suggestion, signer.id, 'partner-signer', partner.id)}
                                                                        style={{
                                                                            padding: '8px 12px',
                                                                            cursor: 'pointer',
                                                                            borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#f5f5f5';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = 'white';
                                                                        }}
                                                                    >
                                                                        <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                                        {suggestion.email && (
                                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                                📧 {suggestion.email}
                                                                            </div>
                                                                        )}
                                                                        {suggestion.phone && (
                                                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                                📱 {suggestion.phone}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Email <span style={{ color: 'red' }}>*</span></label>
                                                        <input
                                                            type="email"
                                                            value={signer.email}
                                                            onChange={(e) => updatePartnerSigner(partner.id, signer.id, 'email', e.target.value)}
                                                            placeholder="Nhập email"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Số điện thoại</label>
                                                        <input
                                                            type="tel"
                                                            value={signer.phone || ''}
                                                            onChange={(e) => updatePartnerSigner(partner.id, signer.id, 'phone', e.target.value)}
                                                            placeholder="Nhập số điện thoại"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
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
                                                        <label>Mã số thuế/CMT/CCCD <span style={{ color: 'red' }}>*</span></label>
                                                        <input
                                                            type="text"
                                                            value={signer.card_id || signer.cardId || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                updatePartnerSigner(partner.id, signer.id, 'card_id', value);
                                                                updatePartnerSigner(partner.id, signer.id, 'cardId', value);
                                                            }}
                                                            placeholder="Nhập Mã số thuế/CMT/CCCD"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Clerks Section - Only for Organization */}
                            {partner.type === 2 && (
                                <div className="clerks-section">
                                    <div className="section-header">
                                        <h4>Văn thư</h4>
                                        <button className="add-btn" onClick={() => addPartnerClerk(partner.id)}>
                                            <span>+</span> Thêm văn thư
                                        </button>
                                    </div>
                                    {partner.clerks.length === 0 ? (
                                        <div className="empty-state">
                                            <p>Chưa có văn thư nào</p>
                                        </div>
                                    ) : (
                                        partner.clerks.map((clerk, index) => (
                                            <div key={clerk.id} className="participant-card">
                                                <div className="participant-header">
                                                    <div className="title-with-order">
                                                        <div className="order-input-box tiny">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={clerk.ordering ?? ''}
                                                                onChange={(e) => updatePartnerClerk(partner.id, clerk.id, 'ordering', e.target.value)}
                                                            />
                                                        </div>
                                                        <h4>Văn thư {index + 1}</h4>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removePartnerClerk(partner.id, clerk.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="participant-form">
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ position: 'relative' }}>
                                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                value={clerk.fullName}
                                                                onChange={(e) => {
                                                                    updatePartnerClerk(partner.id, clerk.id, 'fullName', e.target.value);
                                                                    fetchSuggestions(e.target.value, `partner-clerk-${partner.id}-${clerk.id}`);
                                                                }}
                                                                onFocus={() => {
                                                                    if (nameSuggestions.length > 0) {
                                                                        setShowSuggestions(true);
                                                                        setCurrentInputId(`partner-clerk-${partner.id}-${clerk.id}`);
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    setTimeout(() => {
                                                                        setShowSuggestions(false);
                                                                        setCurrentInputId(null);
                                                                    }, 200);
                                                                }}
                                                                placeholder="Nhập họ và tên"
                                                            />
                                                            {showSuggestions && currentInputId === `partner-clerk-${partner.id}-${clerk.id}` && nameSuggestions.length > 0 && (
                                                                <div className="suggestion-dropdown" style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    right: 0,
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    maxHeight: '200px',
                                                                    overflowY: 'auto',
                                                                    zIndex: 1000,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    {nameSuggestions.map((suggestion, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => handleSuggestionSelect(suggestion, clerk.id, 'partner-clerk', partner.id)}
                                                                            style={{
                                                                                padding: '8px 12px',
                                                                                cursor: 'pointer',
                                                                                borderBottom: idx < nameSuggestions.length - 1 ? '1px solid #eee' : 'none'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.backgroundColor = '#f5f5f5';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.backgroundColor = 'white';
                                                                            }}
                                                                        >
                                                                            <div style={{ fontWeight: '500' }}>{suggestion.name}</div>
                                                                            {suggestion.email && (
                                                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                                                    {suggestion.email}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="email"
                                                                value={clerk.email}
                                                                onChange={(e) => updatePartnerClerk(partner.id, clerk.id, 'email', e.target.value)}
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
                                                                onChange={(e) => updatePartnerClerk(partner.id, clerk.id, 'phone', e.target.value)}
                                                                placeholder="Nhập số điện thoại"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
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
                                                            <label>Mã số thuế/CMT/CCCD <span style={{ color: 'red' }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                value={clerk.card_id || clerk.cardId || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    updatePartnerClerk(partner.id, clerk.id, 'card_id', value);
                                                                    updatePartnerClerk(partner.id, clerk.id, 'cardId', value);
                                                                }}
                                                                placeholder="Nhập Mã số thuế/CMT/CCCD"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DocumentSigners;
