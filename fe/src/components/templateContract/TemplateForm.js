import React, { useState } from 'react';
import '../../styles/documentForm.css';
import TemplateInfoStep from './TemplateInfoStep';
import DocumentSigners from '../createContract/DocumentSigners';
import DocumentEditor from '../createContract/DocumentEditor';
import TemplateConfirmation from './TemplateConfirmation';

// Helper function để convert date format từ DD/MM/YYYY sang YYYY-MM-DD
const convertDateFormat = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
};

const TemplateForm = ({ onBack, editTemplate = null }) => {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Tạo mock API data để fill form khi edit
    const mockTemplateData = editTemplate ? {
        templateName: editTemplate.name || editTemplate.templateId || '',
        templateCode: editTemplate.contractCode || editTemplate.id || '',
        documentType: editTemplate.type_id || '',
        startDate: editTemplate.start_time ? editTemplate.start_time.split('T')[0] : '',
        endDate: editTemplate.end_time ? editTemplate.end_time.split('T')[0] : (editTemplate.date ? convertDateFormat(editTemplate.date) : ''),
        attachedFile: editTemplate.attachedFile || '',
        organization: editTemplate.organization_name || editTemplate.partyA || 'Trung tâm công nghệ thông tin MobiFone',
        printWorkflow: editTemplate.printWorkflow || false,
        loginByPhone: editTemplate.loginByPhone || false
    } : {
        templateName: '',
        templateCode: '',
        documentType: '',
        startDate: '',
        endDate: '',
        attachedFile: '',
        organization: 'Trung tâm công nghệ thông tin MobiFone',
        printWorkflow: false,
        loginByPhone: false
    };

    const [formData, setFormData] = useState(mockTemplateData);

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
        { id: 1, title: 'THÔNG TIN MẪU TÀI LIỆU', active: currentStep === 1 },
        { id: 2, title: 'XÁC ĐỊNH NGƯỜI KÝ', active: currentStep === 2 },
        { id: 3, title: 'THIẾT KẾ MẪU TÀI LIỆU', active: currentStep === 3 },
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
        } else {
            onBack && onBack();
        }
    };

    const handleSaveDraft = () => {
        console.log('Saving template draft:', formData);
        // Implement save draft functionality
    };

    const handleComplete = () => {
        console.log('Completing template:', formData);
        // Implement complete functionality
        onBack && onBack();
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
        return (
            <TemplateInfoStep
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileUpload={handleFileUpload}
            />
        );
    };

    const renderStep2 = () => {
        return (
            <DocumentSigners
                documentType="single-no-template"
                formData={formData}
                setFormData={setFormData}
                reviewers={reviewers}
                addReviewer={addReviewer}
                signers={signers}
                addSigner={addSigner}
                removeSigner={removeSigner}
                updateSigner={updateSigner}
                documentClerks={documentClerks}
                addDocumentClerk={addDocumentClerk}
            />
        );
    };

    const renderStep3 = () => {
        return (
            <DocumentEditor
                documentType="single-no-template"
                onBack={() => setCurrentStep(2)}
                onNext={() => setCurrentStep(4)}
                onSaveDraft={() => {
                    console.log('Lưu nháp từ TemplateForm');
                    // Logic lưu nháp
                }}
                hideFooter={true}
            />
        );
    };

    const renderStep4 = () => {
        return (
            <TemplateConfirmation
                formData={formData}
                setFormData={setFormData}
                reviewers={reviewers}
                signers={signers}
                documentClerks={documentClerks}
                onBack={() => setCurrentStep(3)}
                onComplete={handleComplete}
                onSaveDraft={handleSaveDraft}
            />
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
                    {currentStep > 1 && currentStep < 4 && (
                        <button className="back-btn" onClick={handleBack}>
                            Quay lại
                        </button>
                    )}
                    {currentStep === 1 && (
                        <button className="back-btn" onClick={handleBack}>
                            Quay lại
                        </button>
                    )}
                    {currentStep < 4 && (
                        <div className="footer-right">
                            <button className="save-draft-btn" onClick={handleSaveDraft}>
                                Lưu nháp
                            </button>
                            <button className="next-btn" onClick={handleNext}>
                                Tiếp theo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateForm;

