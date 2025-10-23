import React, { useState } from 'react';
import '../../styles/documentForm.css';

const DocumentForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [documentType, setDocumentType] = useState('single-no-template');
    const [formData, setFormData] = useState({
        documentName: '',
        documentNumber: '',
        documentTemplate: '',
        documentType: '',
        relatedDocuments: '',
        message: '',
        expirationDate: '',
        signingExpirationDate: '20/11/2025',
        attachedFile: '',
        uploadToMinistry: 'Không',
        templateFile: '',
        batchFile: '',
        organization: 'Trung tâm công nghệ thông tin MobiFone',
        printWorkflow: false,
        loginByPhone: false
    });

    const [reviewers, setReviewers] = useState([]);
    const [signers, setSigners] = useState([
        {
            id: 1,
            fullName: '',
            email: '',
            signType: '',
            loginByPhone: false
        }
    ]);
    const [documentClerks, setDocumentClerks] = useState([]);

    const steps = [
        { id: 1, title: 'THÔNG TIN TÀI LIỆU', active: currentStep === 1 },
        { id: 2, title: 'XÁC ĐỊNH NGƯỜI KÝ', active: currentStep === 2 },
        { id: 3, title: 'THIẾT KẾ TÀI LIỆU', active: currentStep === 3 },
        { id: 4, title: 'XÁC NHẬN VÀ HOÀN TẤT', active: currentStep === 4 }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                attachedFile: file.name
            }));
        }
    };

    const handleTemplateFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                templateFile: file.name
            }));
        }
    };

    const handleBatchFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                batchFile: file.name
            }));
        }
    };

    const addReviewer = () => {
        const newReviewer = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: ''
        };
        setReviewers([...reviewers, newReviewer]);
    };

    const addSigner = () => {
        const newSigner = {
            id: Date.now(),
            fullName: '',
            email: '',
            signType: '',
            loginByPhone: false
        };
        setSigners([...signers, newSigner]);
    };

    const addDocumentClerk = () => {
        const newClerk = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: ''
        };
        setDocumentClerks([...documentClerks, newClerk]);
    };

    const updateSigner = (id, field, value) => {
        setSigners(signers.map(signer => 
            signer.id === id ? { ...signer, [field]: value } : signer
        ));
    };

    const removeSigner = (id) => {
        if (signers.length > 1) {
            setSigners(signers.filter(signer => signer.id !== id));
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = () => {
        console.log('Saving draft:', formData);
        // Implement save draft functionality
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            default:
                return renderStep1();
        }
    };

    const renderStep1 = () => {
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
                                <label>Tên mẫu tài liệu *</label>
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
                                <label>Mẫu tài liệu *</label>
                                <input
                                    type="text"
                                    name="documentTemplate"
                                    value={formData.documentTemplate}
                                    onChange={handleInputChange}
                                    placeholder="Chọn tài liệu"
                                />
                            </div>
                            <div className="form-group">
                                <label>Số tài liệu</label>
                                <input
                                    type="text"
                                    name="documentNumber"
                                    value={formData.documentNumber}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số tài liệu"
                                />
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
                                <label>Ngày hết hạn ký *</label>
                                <div className="date-input-container">
                                    <input
                                        type="text"
                                        name="signingExpirationDate"
                                        value={formData.signingExpirationDate}
                                        onChange={handleInputChange}
                                        placeholder="20/11/2025"
                                    />
                                    <span className="calendar-icon">📅</span>
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
                                <label>Tên tài liệu *</label>
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
                                <label>Ngày hết hiệu lực tài liệu</label>
                                <div className="date-input-container">
                                    <input
                                        type="text"
                                        name="expirationDate"
                                        value={formData.expirationDate}
                                        onChange={handleInputChange}
                                        placeholder=""
                                    />
                                    <span className="calendar-icon">📅</span>
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
                        accept=".docx,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload-single"
                    />
                    <label htmlFor="file-upload-single" className="file-upload-label">
                        {formData.attachedFile || 'Chọn file'}
                    </label>
                </div>

                <div className="form-content">
                    <div className="left-column">
                        <div className="form-group">
                            <label>Tên tài liệu *</label>
                            <input
                                type="text"
                                name="documentName"
                                value={formData.documentName}
                                onChange={handleInputChange}
                                placeholder="Tên tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Số tài liệu</label>
                            <input
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleInputChange}
                                placeholder="Số tài liệu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Tài liệu liên quan</label>
                            <div className="dropdown-container">
                                <input
                                    type="text"
                                    name="relatedDocuments"
                                    value={formData.relatedDocuments}
                                    onChange={handleInputChange}
                                    placeholder="Tài liệu đã hoàn thành hoặc trong menu Quản lý thư mục"
                                />
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
                        <div className="form-group">
                            <label>Ngày hết hiệu lực tài liệu</label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                <span className="calendar-icon">📅</span>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
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
                            <label>Loại tài liệu</label>
                            <div className="dropdown-container">
                                <input
                                    type="text"
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleInputChange}
                                    placeholder="Chọn loại tài liệu"
                                />
                                <span className="dropdown-icon">▼</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Ngày hết hạn ký *</label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    name="signingExpirationDate"
                                    value={formData.signingExpirationDate}
                                    onChange={handleInputChange}
                                    placeholder="20/11/2025"
                                />
                                <span className="calendar-icon">📅</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep2 = () => {
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
    };

    const renderStep3 = () => {
        return (
            <div className="step-content">
                <h3>Thiết kế tài liệu</h3>
                <p>Nội dung bước 3 sẽ được thêm vào đây</p>
            </div>
        );
    };

    const renderStep4 = () => {
        return (
            <div className="step-content">
                <h3>Xác nhận và hoàn tất</h3>
                <p>Nội dung bước 4 sẽ được thêm vào đây</p>
            </div>
        );
    };

    return (
        <div className="document-form-container">
            <div className="document-form-wrapper">
                <div className="form-header">
                    <div className="step-indicator">
                        {steps.map((step) => (
                            <div key={step.id} className={`step ${step.active ? 'active' : ''}`}>
                                <div className={`step-circle ${step.active ? 'active' : ''}`}>
                                    {step.id}
                                </div>
                                <div className="step-title">{step.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-body">
                    {renderStepContent()}
                </div>

                <div className="form-footer">
                    {currentStep > 1 && (
                        <button className="back-btn" onClick={handleBack}>
                            Quay lại
                        </button>
                    )}
                    <div className="footer-right">
                        <button className="save-draft-btn" onClick={handleSaveDraft}>
                            Lưu nháp
                        </button>
                        <button className="next-btn" onClick={handleNext}>
                            Tiếp theo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentForm;
