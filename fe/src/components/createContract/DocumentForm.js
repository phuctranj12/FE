import React, { useState } from 'react';
import '../../styles/documentForm.css';
import DocumentTypeSelection from './DocumentTypeSelection';
import DocumentSigners from './DocumentSigners';
import DocumentEditor from './DocumentEditor';
import DocumentConfirmation from './DocumentConfirmation';

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

    // Điều chỉnh số bước dựa trên loại tài liệu
    const getSteps = () => {
        if (documentType === 'batch') {
            return [
                { id: 1, title: 'THÔNG TIN TÀI LIỆU', active: currentStep === 1 },
                { id: 2, title: 'XÁC NHẬN VÀ HOÀN TẤT', active: currentStep === 2 }
            ];
        }
        return [
            { id: 1, title: 'THÔNG TIN TÀI LIỆU', active: currentStep === 1 },
            { id: 2, title: 'XÁC ĐỊNH NGƯỜI KÝ', active: currentStep === 2 },
            { id: 3, title: 'THIẾT KẾ TÀI LIỆU', active: currentStep === 3 },
            { id: 4, title: 'XÁC NHẬN VÀ HOÀN TẤT', active: currentStep === 4 }
        ];
    };

    const steps = getSteps();
    const maxStep = documentType === 'batch' ? 2 : 4;

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
        if (currentStep < maxStep) {
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

    const handleComplete = () => {
        console.log('Completing document:', formData);
        // Implement complete functionality
    };

    const renderStepContent = () => {
        // Nếu là batch document, chỉ có 2 bước
        if (documentType === 'batch') {
            switch (currentStep) {
                case 1:
                    return renderStep1();
                case 2:
                    return renderStep4(); // Confirmation step
                default:
                    return renderStep1();
            }
        }
        
        // Normal flow với 4 bước
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
            <DocumentTypeSelection
                documentType={documentType}
                setDocumentType={setDocumentType}
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileUpload={handleFileUpload}
                handleBatchFileUpload={handleBatchFileUpload}
            />
        );
    };

    const renderStep2 = () => {
        return (
            <DocumentSigners
                documentType={documentType}
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
                documentType={documentType}
                onBack={() => setCurrentStep(2)}
                onNext={() => setCurrentStep(4)}
                onSaveDraft={() => {
                    console.log('Lưu nháp từ DocumentForm');
                    // Logic lưu nháp
                }}
                hideFooter={true}
            />
        );
    };

    const renderStep4 = () => {
        return (
            <DocumentConfirmation
                documentType={documentType}
                formData={formData}
                setFormData={setFormData}
                reviewers={reviewers}
                signers={signers}
                documentClerks={documentClerks}
                onBack={() => setCurrentStep(documentType === 'batch' ? 1 : 3)}
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
                    {currentStep > 1 && currentStep < maxStep && (
                        <button className="back-btn" onClick={handleBack}>
                            Quay lại
                        </button>
                    )}
                    {currentStep < maxStep && (
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

export default DocumentForm;
