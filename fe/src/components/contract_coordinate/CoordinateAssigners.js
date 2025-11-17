import React, { useState } from 'react';
import '../../styles/coordinateAssigners.css';

function CoordinateAssigners({
    partner = '',
    onPartnerChange,
    reviewers = [],
    addReviewer,
    updateReviewer,
    removeReviewer,
    signers = [],
    addSigner,
    updateSigner,
    removeSigner,
    clerks = [],
    addClerk,
    updateClerk,
    removeClerk,
    onBack,
    onNext,
    currentStep = 1,
    totalSteps = 3,
    timer = null
}) {

    const renderStepIndicator = () => {
        const steps = [
            { id: 1, title: 'XÁC ĐỊNH NGƯỜI XỬ LÝ TÀI LIỆU', active: currentStep === 1 },
            { id: 2, title: 'THIẾT KẾ TÀI LIỆU', active: currentStep === 2 },
            { id: 3, title: 'XÁC NHẬN THÔNG TIN TÀI LIỆU', active: currentStep === 3 }
        ];

        return (
            <div className="coordinate-step-indicator">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className={`coordinate-step ${step.active ? 'active' : ''}`}>
                            <div className={`coordinate-step-circle ${step.active ? 'active' : ''}`}>
                                {step.id}
                            </div>
                            <div className="coordinate-step-title">{step.title}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`coordinate-step-line ${step.active ? 'active' : ''}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="coordinate-assigners-container">
            {/* Timer */}
            {timer && (
                <div className="coordinate-timer">
                    {timer}
                </div>
            )}

            {/* Step Indicator */}
            <div className="coordinate-header">
                {renderStepIndicator()}
            </div>

            {/* Partner Input */}
            <div className="coordinate-partner-section">
                <label className="coordinate-label">Đối tác</label>
                <input
                    type="text"
                    className="coordinate-input"
                    value={partner}
                    onChange={(e) => onPartnerChange && onPartnerChange(e.target.value)}
                    placeholder="aaaaa"
                />
            </div>

            {/* Role Assignment Sections */}
            <div className="coordinate-roles-container">
                {/* Reviewers Section */}
                <div className="coordinate-role-section">
                    <div className="coordinate-role-header">
                        <h3 className="coordinate-role-title">Người xem xét</h3>
                        <button 
                            className="coordinate-add-link"
                            onClick={addReviewer}
                        >
                            Thêm người xem xét
                        </button>
                    </div>
                    {reviewers.length === 0 ? (
                        <div className="coordinate-empty-state">
                            <p>Chưa có người xem xét nào</p>
                        </div>
                    ) : (
                        reviewers.map((reviewer, index) => (
                            <div key={reviewer.id || index} className="coordinate-participant-card">
                                <div className="coordinate-participant-header">
                                    <div className="coordinate-title-with-order">
                                        <div className="coordinate-order-box">
                                            <input
                                                type="number"
                                                min="1"
                                                value={reviewer.ordering || index + 1}
                                                onChange={(e) => updateReviewer && updateReviewer(reviewer.id, 'ordering', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <h4>Người xem xét {index + 1}</h4>
                                    </div>
                                    <button 
                                        className="coordinate-remove-btn"
                                        onClick={() => removeReviewer && removeReviewer(reviewer.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="coordinate-participant-form">
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Họ tên *</label>
                                            <input
                                                type="text"
                                                value={reviewer.fullName || ''}
                                                onChange={(e) => updateReviewer && updateReviewer(reviewer.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={reviewer.email || ''}
                                                onChange={(e) => updateReviewer && updateReviewer(reviewer.id, 'email', e.target.value)}
                                                placeholder="Nhập email"
                                            />
                                        </div>
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>
                                                Số điện thoại
                                                <span className="coordinate-helper-text"> (Nhận thông báo khi xử lý tài liệu)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={reviewer.phone || ''}
                                                onChange={(e) => updateReviewer && updateReviewer(reviewer.id, 'phone', e.target.value)}
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
                <div className="coordinate-role-section">
                    <div className="coordinate-role-header">
                        <h3 className="coordinate-role-title">Người ký</h3>
                        <button 
                            className="coordinate-add-link"
                            onClick={addSigner}
                        >
                            Thêm người ký
                        </button>
                    </div>
                    {signers.length === 0 ? (
                        <div className="coordinate-empty-state">
                            <p>Chưa có người ký nào</p>
                        </div>
                    ) : (
                        signers.map((signer, index) => (
                            <div key={signer.id || index} className="coordinate-participant-card">
                                {/* Login Method Radio Buttons */}
                                <div className="coordinate-login-method">
                                    <label className="coordinate-radio-option">
                                        <input
                                            type="radio"
                                            name={`signer-login-${signer.id}`}
                                            checked={!signer.loginByPhone}
                                            onChange={() => updateSigner && updateSigner(signer.id, 'loginByPhone', false)}
                                        />
                                        <span>Đăng nhập bằng email</span>
                                    </label>
                                    <label className="coordinate-radio-option">
                                        <input
                                            type="radio"
                                            name={`signer-login-${signer.id}`}
                                            checked={signer.loginByPhone}
                                            onChange={() => updateSigner && updateSigner(signer.id, 'loginByPhone', true)}
                                        />
                                        <span>Đăng nhập bằng số điện thoại</span>
                                    </label>
                                </div>
                                <div className="coordinate-participant-header">
                                    <div className="coordinate-title-with-order">
                                        <div className="coordinate-order-box">
                                            <input
                                                type="number"
                                                min="1"
                                                value={signer.ordering || index + 1}
                                                onChange={(e) => updateSigner && updateSigner(signer.id, 'ordering', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <h4>Người ký {index + 1}</h4>
                                    </div>
                                    {signers.length > 1 && (
                                        <button 
                                            className="coordinate-remove-btn"
                                            onClick={() => removeSigner && removeSigner(signer.id)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <div className="coordinate-participant-form">
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Họ tên *</label>
                                            <input
                                                type="text"
                                                value={signer.fullName || ''}
                                                onChange={(e) => updateSigner && updateSigner(signer.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>{signer.loginByPhone ? 'Số điện thoại *' : 'Email *'}</label>
                                            {signer.loginByPhone ? (
                                                <input
                                                    type="tel"
                                                    value={signer.phone || ''}
                                                    onChange={(e) => updateSigner && updateSigner(signer.id, 'phone', e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            ) : (
                                                <input
                                                    type="email"
                                                    value={signer.email || ''}
                                                    onChange={(e) => updateSigner && updateSigner(signer.id, 'email', e.target.value)}
                                                    placeholder="Nhập email"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Loại ký *</label>
                                            <select
                                                value={signer.signType || 'hsm'}
                                                onChange={(e) => updateSigner && updateSigner(signer.id, 'signType', e.target.value)}
                                                className="coordinate-select"
                                            >
                                                <option value="hsm">Chứng thư số HSM</option>
                                            </select>
                                            <div className="coordinate-warning-text">
                                                Lưu ý: bạn chỉ được phép chọn 1 kiểu ký số!
                                            </div>
                                        </div>
                                        {!signer.loginByPhone && (
                                            <div className="coordinate-form-group">
                                                <label>
                                                    Số điện thoại
                                                    <span className="coordinate-helper-text"> (Nhận thông báo khi xử lý tài liệu)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={signer.phone || ''}
                                                    onChange={(e) => updateSigner && updateSigner(signer.id, 'phone', e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Clerks Section */}
                <div className="coordinate-role-section">
                    <div className="coordinate-role-header">
                        <h3 className="coordinate-role-title">Văn thư</h3>
                        <button 
                            className="coordinate-add-link"
                            onClick={addClerk}
                        >
                            Thêm văn thư
                        </button>
                    </div>
                    {clerks.length === 0 ? (
                        <div className="coordinate-empty-state">
                            <p>Chưa có văn thư nào</p>
                        </div>
                    ) : (
                        clerks.map((clerk, index) => (
                            <div key={clerk.id || index} className="coordinate-participant-card">
                                <div className="coordinate-participant-header">
                                    <div className="coordinate-title-with-order">
                                        <div className="coordinate-order-box">
                                            <input
                                                type="number"
                                                min="1"
                                                value={clerk.ordering || index + 1}
                                                onChange={(e) => updateClerk && updateClerk(clerk.id, 'ordering', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <h4>Văn thư {index + 1}</h4>
                                    </div>
                                    <button 
                                        className="coordinate-remove-btn"
                                        onClick={() => removeClerk && removeClerk(clerk.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="coordinate-participant-form">
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Họ tên *</label>
                                            <input
                                                type="text"
                                                value={clerk.fullName || ''}
                                                onChange={(e) => updateClerk && updateClerk(clerk.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={clerk.email || ''}
                                                onChange={(e) => updateClerk && updateClerk(clerk.id, 'email', e.target.value)}
                                                placeholder="Nhập email"
                                            />
                                        </div>
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Loại ký *</label>
                                            <select
                                                value={clerk.signType || 'hsm'}
                                                onChange={(e) => updateClerk && updateClerk(clerk.id, 'signType', e.target.value)}
                                                className="coordinate-select"
                                            >
                                                <option value="hsm">Chứng thư số HSM</option>
                                            </select>
                                            <div className="coordinate-warning-text">
                                                Lưu ý: bạn chỉ được phép chọn 1 kiểu ký số!
                                            </div>
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>
                                                Số điện thoại
                                                <span className="coordinate-helper-text"> (Nhận thông báo khi xử lý tài liệu)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={clerk.phone || ''}
                                                onChange={(e) => updateClerk && updateClerk(clerk.id, 'phone', e.target.value)}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="coordinate-footer">
                {onBack && (
                    <button className="coordinate-back-btn" onClick={onBack}>
                        Quay lại
                    </button>
                )}
                {onNext && (
                    <button className="coordinate-next-btn" onClick={onNext}>
                        Tiếp theo
                    </button>
                )}
            </div>
        </div>
    );
}

export default CoordinateAssigners;

