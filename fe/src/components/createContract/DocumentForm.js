import React, { useState, useEffect } from 'react';
import '../../styles/documentForm.css';
import DocumentTypeSelection from './DocumentTypeSelection';
import DocumentSigners from './DocumentSigners';
import DocumentEditor from './DocumentEditor';
import DocumentConfirmation from './DocumentConfirmation';
import customerService from '../../api/customerService';
import contractService from '../../api/contractService';

const DocumentForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [documentType, setDocumentType] = useState('single-no-template');
    
    // User and Organization data
    const [currentUser, setCurrentUser] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [relatedContracts, setRelatedContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Contract and Document IDs (saved after API calls)
    const [contractId, setContractId] = useState(null);
    const [documentId, setDocumentId] = useState(null);
    const [isDocumentNumberValid, setIsDocumentNumberValid] = useState(true);
    const [isCheckingDocumentNumber, setIsCheckingDocumentNumber] = useState(false);
    
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
        organization: '',
        printWorkflow: false,
        loginByPhone: false,
        // Thông tin file PDF
        pdfFile: null,
        pdfFileName: '',
        pdfPageCount: 0,
        hasSignature: false,
        // Thông tin file đính kèm
        attachedFiles: [] // Array of File objects
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

    // Fetch initial data when component mounts
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Gọi API lấy thông tin user từ token
                const userResponse = await customerService.getCustomerByToken();
                if (userResponse.code === 'SUCCESS' && userResponse.data) {
                    setCurrentUser(userResponse.data);
                    const orgId = userResponse.data.organizationId;
                    setOrganizationId(orgId);
                    
                    // Update organization name in form
                    setFormData(prev => ({
                        ...prev,
                        organization: userResponse.data.organizationName || ''
                    }));

                    // 2. Gọi API lấy danh sách loại tài liệu
                    const typesResponse = await contractService.getAllTypes({
                        page: 0,
                        size: 100,
                        organizationId: orgId
                    });
                    
                    if (typesResponse.code === 'SUCCESS' && typesResponse.data) {
                        setDocumentTypes(typesResponse.data.content || []);
                    }

                    // 3. Gọi API lấy danh sách hợp đồng liên quan
                    const refsResponse = await contractService.getAllContractRefs({
                        page: 0,
                        size: 100,
                        organizationId: orgId
                    });
                    
                    if (refsResponse.code === 'SUCCESS' && refsResponse.data) {
                        setRelatedContracts(refsResponse.data.content || []);
                    }
                } else {
                    throw new Error(userResponse.message || 'Không thể lấy thông tin người dùng');
                }

            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
                // Show error notification to user
                alert(err.message || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

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

    // API 6: Kiểm tra mã hợp đồng unique
    const handleDocumentNumberBlur = async () => {
        const documentNumber = formData.documentNumber?.trim();
        
        // Nếu không nhập số tài liệu thì bỏ qua (vì optional)
        if (!documentNumber) {
            setIsDocumentNumberValid(true);
            return;
        }

        try {
            setIsCheckingDocumentNumber(true);
            const response = await contractService.checkCodeUnique(documentNumber);
            
            if (response.code === 'SUCCESS') {
                // API trả về true nếu unique (có thể dùng), false nếu đã tồn tại
                const isUnique = response.data === true;
                setIsDocumentNumberValid(isUnique);
                
                if (!isUnique) {
                    alert('Mã hợp đồng đã tồn tại. Vui lòng nhập mã khác.');
                }
            }
        } catch (err) {
            console.error('Error checking document number:', err);
            // Nếu lỗi API thì cho phép tiếp tục
            setIsDocumentNumberValid(true);
        } finally {
            setIsCheckingDocumentNumber(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Chỉ hỗ trợ file PDF');
            return;
        }

        try {
            setLoading(true);

            // 1. Gọi API kiểm tra số trang
            const pageSizeResponse = await contractService.getPageSize(file);
            
            if (pageSizeResponse.code !== 'SUCCESS') {
                throw new Error(pageSizeResponse.message || 'Không thể kiểm tra số trang của file');
            }

            const pageCount = pageSizeResponse.data?.numberOfPages || 0;

            // 2. Gọi API kiểm tra chữ ký số
            const signatureResponse = await contractService.checkSignature(file);
            
            if (signatureResponse.code !== 'SUCCESS') {
                throw new Error(signatureResponse.message || 'Không thể kiểm tra chữ ký số');
            }

            const hasSignature = signatureResponse.data?.hasSignature || false;

            // 3. Validate: Nếu có chữ ký số thì báo lỗi
            if (hasSignature) {
                alert('Tài liệu đã có chữ ký số, vui lòng chọn file khác');
                e.target.value = ''; // Reset input
                return;
            }

            // 4. Cập nhật formData
            setFormData(prev => ({
                ...prev,
                pdfFile: file,
                pdfFileName: file.name,
                pdfPageCount: parseInt(pageCount),
                hasSignature: hasSignature,
                attachedFile: file.name
            }));

            console.log(`File uploaded successfully: ${file.name}, Pages: ${pageCount}, Has Signature: ${hasSignature}`);

        } catch (err) {
            console.error('Error uploading file:', err);
            alert(err.message || 'Đã xảy ra lỗi khi tải file. Vui lòng thử lại.');
            e.target.value = ''; // Reset input
        } finally {
            setLoading(false);
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

    // Handle attached files upload (type = 3)
    const handleAttachedFilesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                attachedFiles: [...prev.attachedFiles, ...files],
                attachedFile: files.map(f => f.name).join(', ')
            }));
        }
    };

    // Remove attached file
    const removeAttachedFile = (index) => {
        setFormData(prev => {
            const newFiles = prev.attachedFiles.filter((_, i) => i !== index);
            return {
                ...prev,
                attachedFiles: newFiles,
                attachedFile: newFiles.map(f => f.name).join(', ')
            };
        });
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

    // Validate Step 1 data
    const validateStep1 = () => {
        const errors = [];

        // Required fields
        if (!formData.documentName?.trim()) {
            errors.push('Tên tài liệu là bắt buộc');
        }

        if (!formData.signingExpirationDate) {
            errors.push('Ngày hết hạn ký là bắt buộc');
        }

        if (!formData.pdfFile) {
            errors.push('Vui lòng tải lên file PDF');
        }

        // Check if document number is valid (if provided)
        if (formData.documentNumber && !isDocumentNumberValid) {
            errors.push('Mã hợp đồng đã tồn tại');
        }

        if (errors.length > 0) {
            alert('Vui lòng kiểm tra lại:\n' + errors.join('\n'));
            return false;
        }

        return true;
    };

    // Convert date format from DD/MM/YYYY to ISO format
    const convertToISODate = (dateStr) => {
        if (!dateStr) return new Date().toISOString();
        
        // If already in ISO format, return as is
        if (dateStr.includes('T')) return dateStr;
        
        // Parse DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
        }
        
        return new Date().toISOString();
    };

    // Handle Next button - Step 1 needs to create contract and upload documents
    const handleNext = async () => {
        // If step 1, validate and create contract + upload documents
        if (currentStep === 1) {
            if (!validateStep1()) {
                return;
            }

            try {
                setLoading(true);

                // API 7: Tạo hợp đồng
                console.log('Creating contract...');
                const contractData = {
                    name: formData.documentName.trim(),
                    contractNo: formData.documentNumber?.trim() || '',
                    signTime: convertToISODate(formData.signingExpirationDate),
                    note: formData.message?.trim() || '',
                    contractRefs: formData.relatedDocuments 
                        ? [{ refId: parseInt(formData.relatedDocuments) }] 
                        : [],
                    typeId: formData.documentType ? parseInt(formData.documentType) : null,
                    isTemplate: false,
                    templateContractId: null,
                    contractExpireTime: formData.expirationDate 
                        ? convertToISODate(formData.expirationDate) 
                        : null
                };

                const contractResponse = await contractService.createContract(contractData);
                
                if (contractResponse.code !== 'SUCCESS' || !contractResponse.data?.id) {
                    throw new Error(contractResponse.message || 'Không thể tạo hợp đồng');
                }

                const newContractId = contractResponse.data.id;
                setContractId(newContractId);
                console.log('Contract created with ID:', newContractId);

                // API 8: Upload file PDF lên MinIO
                console.log('Uploading PDF to MinIO...');
                const uploadResponse = await contractService.uploadDocument(formData.pdfFile);
                
                if (uploadResponse.code !== 'SUCCESS' || !uploadResponse.data) {
                    throw new Error(uploadResponse.message || 'Không thể upload file PDF');
                }

                const { path: uploadedPath, fileName: uploadedFileName } = uploadResponse.data;
                console.log('PDF uploaded:', uploadedPath);

                // API 9: Lưu thông tin tài liệu vào DB (type = 1: file gốc)
                console.log('Creating document record...');
                const documentData = {
                    name: formData.documentName.trim(),
                    type: 1, // File gốc
                    contractId: newContractId,
                    fileName: uploadedFileName,
                    path: uploadedPath,
                    status: 1 // Active
                };

                const documentResponse = await contractService.createDocument(documentData);
                
                if (documentResponse.code !== 'SUCCESS' || !documentResponse.data?.id) {
                    throw new Error(documentResponse.message || 'Không thể lưu thông tin tài liệu');
                }

                const newDocumentId = documentResponse.data.id;
                setDocumentId(newDocumentId);
                console.log('Document created with ID:', newDocumentId);

                // Upload file đính kèm nếu có (type = 3)
                if (formData.attachedFiles && formData.attachedFiles.length > 0) {
                    console.log('Uploading attached files...');
                    
                    for (const file of formData.attachedFiles) {
                        try {
                            // Upload file to MinIO
                            const attachUploadResponse = await contractService.uploadDocument(file);
                            
                            if (attachUploadResponse.code === 'SUCCESS' && attachUploadResponse.data) {
                                // Save document record (type = 3: file đính kèm)
                                const attachDocData = {
                                    name: file.name,
                                    type: 3, // File đính kèm
                                    contractId: newContractId,
                                    fileName: attachUploadResponse.data.fileName,
                                    path: attachUploadResponse.data.path,
                                    status: 1
                                };
                                
                                await contractService.createDocument(attachDocData);
                                console.log('Attached file uploaded:', file.name);
                            }
                        } catch (err) {
                            console.error('Error uploading attached file:', file.name, err);
                            // Continue với các file khác nếu 1 file lỗi
                        }
                    }
                }

                alert('✅ Tạo hợp đồng thành công!\nContract ID: ' + newContractId);
                
                // Move to next step
                setCurrentStep(currentStep + 1);

            } catch (err) {
                console.error('Error in step 1:', err);
                alert('❌ Lỗi: ' + (err.message || 'Không thể tạo hợp đồng. Vui lòng thử lại.'));
            } finally {
                setLoading(false);
            }
        } else {
            // For other steps, just move forward
            if (currentStep < maxStep) {
                setCurrentStep(currentStep + 1);
            }
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
                documentTypes={documentTypes}
                relatedContracts={relatedContracts}
                loading={loading}
                handleDocumentNumberBlur={handleDocumentNumberBlur}
                isCheckingDocumentNumber={isCheckingDocumentNumber}
                isDocumentNumberValid={isDocumentNumberValid}
                handleAttachedFilesUpload={handleAttachedFilesUpload}
                removeAttachedFile={removeAttachedFile}
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

    // Show loading state
    if (loading && !currentUser) {
        return (
            <div className="document-form-container">
                <div className="document-form-wrapper">
                    <div className="loading-message">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && !currentUser) {
        return (
            <div className="document-form-container">
                <div className="document-form-wrapper">
                    <div className="error-message">
                        <p>❌ {error}</p>
                        <button onClick={() => window.location.reload()}>Thử lại</button>
                    </div>
                </div>
            </div>
        );
    }

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
                    {loading && <div className="loading-overlay">Đang xử lý...</div>}
                    {renderStepContent()}
                </div>

                <div className="form-footer">
                    {currentStep > 1 && currentStep < maxStep && (
                        <button className="back-btn" onClick={handleBack} disabled={loading}>
                            Quay lại
                        </button>
                    )}
                    {currentStep < maxStep && (
                        <div className="footer-right">
                            <button className="save-draft-btn" onClick={handleSaveDraft} disabled={loading}>
                                Lưu nháp
                            </button>
                            <button className="next-btn" onClick={handleNext} disabled={loading}>
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
