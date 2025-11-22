import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../../styles/coordinateAssigners.css';
import contractService from '../../api/contractService';
import DocumentEditor from '../createContract/DocumentEditor';

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
    timer = null,
    // Props cho luồng điều phối
    contractId = null,
    recipientId = null,
    participantId = null,
    coordinatorRecipient = null, // Thông tin người điều phối hiện tại
    onCoordinateSuccess = null, // Callback khi điều phối thành công
    onCoordinateError = null // Callback khi điều phối lỗi
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contractInfo, setContractInfo] = useState(null);
    const [participantInfo, setParticipantInfo] = useState(null);
    const [allParticipants, setAllParticipants] = useState([]);
    const [fields, setFields] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [activeDocumentId, setActiveDocumentId] = useState(null);
    const [pendingFields, setPendingFields] = useState([]);
    const [createdRecipients, setCreatedRecipients] = useState([]);
    const [coordinatorDetail, setCoordinatorDetail] = useState(null);
    const currentParticipantId = participantId || participantInfo?.id;

    const lockedFieldIds = useMemo(() => {
        if (!fields || fields.length === 0) return [];
        if (!currentParticipantId) {
            return fields.map(field => field.id);
        }
        return fields
            .filter(field => field.participantId !== currentParticipantId)
            .map(field => field.id);
    }, [fields, currentParticipantId]);

    const loadFieldsByContract = useCallback(async (id) => {
        if (!id) return;
        try {
            const fieldsResponse = await contractService.getFieldsByContract(id);
            if (fieldsResponse?.code === 'SUCCESS') {
                setFields(fieldsResponse.data || []);
            }
        } catch (err) {
            console.error('Error loading fields:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải field');
        }
    }, []);

    const loadDocumentsByContract = useCallback(async (id) => {
        if (!id) return;
        try {
            const documentsResponse = await contractService.getDocumentsByContract(id);
            if (documentsResponse?.code === 'SUCCESS') {
                const docs = documentsResponse.data || [];
                setDocuments(docs);
                setActiveDocumentId(prev => prev || (docs[0]?.id || null));
            }
        } catch (err) {
            console.error('Error loading documents:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải tài liệu');
        }
    }, []);

    useEffect(() => {
        if (!activeDocumentId && fields.length > 0) {
            const documentIdFromField = fields.find(field => field.documentId)?.documentId;
            if (documentIdFromField) {
                setActiveDocumentId(documentIdFromField);
            }
        }
    }, [activeDocumentId, fields]);

    useEffect(() => {
        setPendingFields([]);
    }, [activeDocumentId]);

    useEffect(() => {
        setActiveDocumentId(null);
        setPendingFields([]);
    }, [contractId]);

    // Load dữ liệu khi component mount hoặc khi contractId/recipientId thay đổi
    useEffect(() => {
        const loadData = async () => {
            if (!contractId) return;

            try {
                setLoading(true);
                setError(null);

                // BƯỚC 1: Lấy thông tin hợp đồng
                if (contractId) {
                    const contractResponse = await contractService.getContractById(contractId);
                    if (contractResponse?.code === 'SUCCESS') {
                        setContractInfo(contractResponse.data);
                    }
                }

                // BƯỚC 2: Lấy thông tin participant theo recipient ID
                if (recipientId) {
                    const participantResponse = await contractService.getParticipantByRecipientId(recipientId);
                    if (participantResponse?.code === 'SUCCESS') {
                        setParticipantInfo(participantResponse.data);
                        // participantId sẽ được lấy từ participantInfo nếu chưa được truyền vào
                    }
                }

                // BƯỚC 2: Lấy tất cả participant của hợp đồng
                if (contractId) {
                    const allParticipantsResponse = await contractService.getAllParticipantsByContract(contractId);
                    if (allParticipantsResponse?.code === 'SUCCESS') {
                        setAllParticipants(allParticipantsResponse.data || []);
                    }
                }

                // BƯỚC 3: Lấy thông tin field
                await loadFieldsByContract(contractId);

                // Lấy thông tin tài liệu của hợp đồng
                await loadDocumentsByContract(contractId);
            } catch (err) {
                console.error('Error loading coordination data:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [contractId, recipientId, loadDocumentsByContract, loadFieldsByContract]);

    // Lấy chi tiết coordinator từ recipientId
    useEffect(() => {
        if (!recipientId) {
            setCoordinatorDetail(null);
            return;
        }

        let ignore = false;
        const fetchCoordinatorDetail = async () => {
            try {
                const response = await contractService.getRecipientById(recipientId);
                if (response?.code === 'SUCCESS' && !ignore) {
                    setCoordinatorDetail(response.data);
                }
            } catch (err) {
                console.error('Error fetching coordinator detail:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người điều phối');
            }
        };

        fetchCoordinatorDetail();
        return () => { ignore = true; };
    }, [recipientId]);


    const handleDocumentFieldsChange = (updatedFields = []) => {
        setPendingFields(updatedFields);
    };

    const handleDocumentChange = (event) => {
        const { value } = event.target;
        if (value === '') {
            setActiveDocumentId(null);
            return;
        }
        const numericValue = Number(value);
        setActiveDocumentId(Number.isNaN(numericValue) ? value : numericValue);
    };

    // Xử lý điều phối hợp đồng
    const handleCoordinate = async () => {
        if (!currentParticipantId || !recipientId) {
            setError('Thiếu thông tin participantId hoặc recipientId');
            return;
        }

        // Kiểm tra đã tạo participants chưa
        if (createdRecipients.length === 0) {
            setError('Vui lòng thêm ít nhất một người tham gia xử lý và lưu thông tin');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Chuẩn bị dữ liệu điều phối
            // Phần tử đầu tiên: Người điều phối hiện tại (từ coordinatorDetail)
            const coordinator = coordinatorDetail;

            if (!coordinator) {
                setError('Không tìm thấy thông tin người điều phối hiện tại');
                return;
            }

            // Chuẩn bị recipientsData: [coordinator, ...createdRecipients]
            const recipientsData = [
                coordinator, // Người điều phối (phần tử đầu tiên)
                ...createdRecipients // Các người tham gia đã được tạo với ID từ backend
            ];

            // Gọi API điều phối
            const response = await contractService.coordinate(
                currentParticipantId,
                recipientId,
                recipientsData
            );

            if (response?.code === 'SUCCESS') {
                // Gọi callback thành công nếu có
                if (onCoordinateSuccess) {
                    onCoordinateSuccess(response.data);
                }
                // Gọi onNext nếu có
                if (onNext) {
                    onNext();
                }
            } else {
                throw new Error(response?.message || 'Điều phối thất bại');
            }
        } catch (err) {
            console.error('Error coordinating contract:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi điều phối';
            setError(errorMessage);
            if (onCoordinateError) {
                onCoordinateError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi nhấn "Tiếp theo"
    const handleNext = async () => {
        if (currentStep === 1) {
            // BƯỚC 4: Tạo participant mới (nếu có người tham gia)
            const allRecipients = [
                ...reviewers.map(r => ({ ...r, role: 2 })), // Role 2: Xem xét
                ...signers.map(s => ({ ...s, role: 3 })), // Role 3: Ký
                ...clerks.map(c => ({ ...c, role: 4 })) // Role 4: Văn thư
            ];

            if (allRecipients.length > 0) {
                try {
                    setLoading(true);
                    setError(null);

                    // Chuẩn bị payload cho API tạo participant
                    const participantPayload = [{
                        name: partner || 'Đối tác',
                        type: 2, // Type 2: Đối tác
                        ordering: 2, // Thứ tự sau "Tổ chức của tôi" (ordering = 1)
                        status: 1, // Status 1: Active
                        recipients: allRecipients.map(person => ({
                            name: person.fullName || person.name || '',
                            email: person.email || '',
                            phone: person.phone || '',
                            role: person.role,
                            ordering: person.ordering || 1,
                            status: 0, // Người tham gia mới có status = 0 (chờ xử lý)
                            signType: person.signType === 'hsm' ? 6 : person.signType || 6
                        }))
                    }];

                    const response = await contractService.createParticipant(contractId, participantPayload);
                    if (response?.code === 'SUCCESS') {
                        // Lưu lại recipients đã được tạo với ID từ backend
                        const newRecipients = response.data?.flatMap(p => p.recipients) || [];
                        setCreatedRecipients(newRecipients);
                        if (onNext) {
                            onNext();
                        }
                    } else {
                        throw new Error(response?.message || 'Tạo participant thất bại');
                    }
                } catch (err) {
                    console.error('Error creating participants:', err);
                    setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo participant');
                } finally {
                    setLoading(false);
                }
            } else if (onNext) {
                onNext();
            }
            return;
        }

        if (currentStep === 2) {
            if (pendingFields.length > 0) {
                try {
                    setLoading(true);
                    setError(null);
                    await contractService.createField(pendingFields);
                    await loadFieldsByContract(contractId);
                    setPendingFields([]);
                    if (onNext) {
                        onNext();
                    }
                } catch (err) {
                    console.error('Error saving fields:', err);
                    setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu field');
                } finally {
                    setLoading(false);
                }
            } else if (onNext) {
                onNext();
            }
            return;
        }
        
        // Nếu đang ở step cuối và có đủ thông tin để điều phối
        if (currentStep === totalSteps && currentParticipantId && recipientId) {
            // Kiểm tra đã tạo participants chưa
            if (createdRecipients.length === 0) {
                setError('Vui lòng quay lại bước 1 để thêm người tham gia và lưu thông tin');
                return;
            }
            handleCoordinate();
        } else if (onNext) {
            // Nếu không phải step cuối hoặc chưa có đủ thông tin, gọi onNext bình thường
            onNext();
        }
    };

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

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (Number.isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return '';
        }
    };

    const renderDocumentEditorStep = () => (
        <div className="coordinate-document-editor-section">
            {documents.length > 1 && (
                <div className="coordinate-document-selector">
                    <label>Chọn tài liệu</label>
                    <select value={activeDocumentId ?? ''} onChange={handleDocumentChange}>
                        <option value="">Chọn tài liệu</option>
                        {documents.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                                {doc.name || doc.fileName || `Tài liệu ${doc.id}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <DocumentEditor
                documentType={contractInfo?.documentType || 'single-template'}
                contractId={contractId}
                documentId={activeDocumentId}
                participantsData={allParticipants}
                fieldsData={fields}
                onFieldsChange={handleDocumentFieldsChange}
                hideFooter={true}
                lockedFieldIds={lockedFieldIds}
            />
        </div>
    );

    const renderConfirmationStep = () => {
        const documentName = contractInfo?.name || '';
        const expireDate = formatDate(contractInfo?.contractExpireTime);

        return (
            <div className="coordinate-confirmation-container">
                {/* Thông tin tài liệu */}
                <div className="coordinate-section">
                    <h3 className="coordinate-section-title">Tài liệu</h3>
                    <div className="coordinate-confirmation-grid">
                        <div className="coordinate-confirmation-field">
                            <label>Tên tài liệu</label>
                            <div className="coordinate-confirmation-value">
                                {documentName || '—'}
                            </div>
                        </div>
                        <div className="coordinate-confirmation-field">
                            <label>Lời nhắn</label>
                            <div className="coordinate-confirmation-value">
                                {contractInfo?.note || '—'}
                            </div>
                        </div>
                    </div>
                    <div className="coordinate-confirmation-grid">
                        <div className="coordinate-confirmation-field">
                            <label>Ngày hết hạn ký</label>
                            <div className="coordinate-confirmation-value">
                                {expireDate || '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các bên ký */}
                <div className="coordinate-section">
                    <h3 className="coordinate-section-title">Các bên ký</h3>

                    {/* Tổ chức của tôi (người điều phối hiện tại) */}
                    <div className="coordinate-party-card">
                        <div className="coordinate-party-header">
                            <span className="coordinate-party-title">TỔ CHỨC CỦA TÔI</span>
                        </div>
                        <div className="coordinate-party-body">
                            <div className="coordinate-confirmation-field">
                                <label>Người điều phối</label>
                                <div className="coordinate-confirmation-value">
                                    {coordinatorRecipient
                                        ? `${coordinatorRecipient.name || ''} - ${coordinatorRecipient.email || ''}`
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Đối tác */}
                    <div className="coordinate-party-card">
                        <div className="coordinate-party-header">
                            <span className="coordinate-party-title">
                                {partner ? `ĐỐI TÁC ${partner}` : 'ĐỐI TÁC'}
                            </span>
                        </div>
                        <div className="coordinate-party-body">
                            <div className="coordinate-confirmation-field">
                                <label>Người xem xét</label>
                                <div className="coordinate-confirmation-value-list">
                                    {reviewers && reviewers.length > 0 ? (
                                        reviewers.map((r, idx) => (
                                            <div key={r.id || idx}>
                                                {r.fullName || '—'}{r.email ? ` - ${r.email}` : ''}
                                            </div>
                                        ))
                                    ) : (
                                        <span>—</span>
                                    )}
                                </div>
                            </div>
                            <div className="coordinate-confirmation-field">
                                <label>Người ký</label>
                                <div className="coordinate-confirmation-value-list">
                                    {signers && signers.length > 0 ? (
                                        signers.map((s, idx) => (
                                            <div key={s.id || idx}>
                                                {s.fullName || '—'}{s.email ? ` - ${s.email}` : ''}
                                            </div>
                                        ))
                                    ) : (
                                        <span>—</span>
                                    )}
                                </div>
                            </div>
                            <div className="coordinate-confirmation-field">
                                <label>Văn thư</label>
                                <div className="coordinate-confirmation-value-list">
                                    {clerks && clerks.length > 0 ? (
                                        clerks.map((c, idx) => (
                                            <div key={c.id || idx}>
                                                {c.fullName || '—'}{c.email ? ` - ${c.email}` : ''}
                                            </div>
                                        ))
                                    ) : (
                                        <span>—</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

            {/* Error Message */}
            {error && (
                <div className="coordinate-error-message" style={{
                    padding: '10px',
                    marginBottom: '15px',
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: '4px',
                    border: '1px solid #fcc'
                }}>
                    {error}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="coordinate-loading" style={{
                    padding: '10px',
                    marginBottom: '15px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    Đang xử lý...
                </div>
            )}

            {/* Step Indicator */}
            <div className="coordinate-header">
                {renderStepIndicator()}
            </div>

            {/* Partner Input */}
            {currentStep !== 2 && (
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
            )}

            {/* Role Assignment Sections / Document Designer / Confirmation */}
            {currentStep === 2 ? (
                renderDocumentEditorStep()
            ) : currentStep === 3 ? (
                renderConfirmationStep()
            ) : (
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
            )}

            {/* Navigation Buttons */}
            <div className="coordinate-footer">
                {onBack && (
                    <button 
                        className="coordinate-back-btn" 
                        onClick={onBack}
                        disabled={loading}
                    >
                        Quay lại
                    </button>
                )}
                {(onNext || (currentStep === totalSteps && currentParticipantId && recipientId)) && (
                    <button 
                        className="coordinate-next-btn" 
                        onClick={handleNext}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (currentStep === totalSteps && currentParticipantId && recipientId ? 'Điều phối' : 'Tiếp theo')}
                    </button>
                )}
            </div>
        </div>
    );
}

export default CoordinateAssigners;

