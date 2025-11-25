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
    const [existingPartnerRecipients, setExistingPartnerRecipients] = useState([]);
    const [initialParticipantEmails, setInitialParticipantEmails] = useState(new Set());
    const [allParticipants, setAllParticipants] = useState([]);
    const [fields, setFields] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [activeDocumentId, setActiveDocumentId] = useState(null);
    const [pendingFields, setPendingFields] = useState([]);
    const [createdRecipients, setCreatedRecipients] = useState([]);
    const [coordinatorDetail, setCoordinatorDetail] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [toasts, setToasts] = useState([]);
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

    const showToast = useCallback((message, variant = 'error', durationMs = 4000) => {
        if (!message) return;
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, durationMs);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

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

    const isEmailDuplicate = (email, entryType, entryId) => {
        if (!email) return false;
        const normalized = email.trim().toLowerCase();
        if (initialParticipantEmails.has(normalized)) {
            return true;
        }

        const checkList = (list) =>
            list.some(item =>
                item?.email &&
                item.email.trim().toLowerCase() === normalized &&
                item.id !== entryId
            );

        if (checkList(reviewers)) return true;
        if (checkList(signers)) return true;
        if (checkList(clerks)) return true;
        return false;
    };

    useEffect(() => {
        if (error) {
            showToast(error, 'error');
            const timer = setTimeout(() => setError(null), 0);
            return () => clearTimeout(timer);
        }
    }, [error, showToast]);

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
                        const participantData = participantResponse.data;
                        setParticipantInfo(participantData);
                        setExistingPartnerRecipients(participantData?.recipients || []);
                        // participantId sẽ được lấy từ participantInfo nếu chưa được truyền vào
                        if (participantData?.name && typeof onPartnerChange === 'function') {
                            onPartnerChange(participantData.name);
                        }
                    }
                }

                // BƯỚC 2: Lấy tất cả participant của hợp đồng
                if (contractId) {
                    const allParticipantsResponse = await contractService.getAllParticipantsByContract(contractId);
                    if (allParticipantsResponse?.code === 'SUCCESS') {
                        const participantsData = allParticipantsResponse.data || [];
                        setAllParticipants(participantsData);
                        const emailSet = new Set();
                        participantsData.forEach(participant => {
                            participant.recipients?.forEach(recipient => {
                                if (recipient.email) {
                                    emailSet.add(recipient.email.trim().toLowerCase());
                                }
                            });
                        });
                        setInitialParticipantEmails(emailSet);
                    }
                }

                // BƯỚC 3: Lấy thông tin field
                await loadFieldsByContract(contractId);

                // Lấy thông tin tài liệu của hợp đồng
                // await loadDocumentsByContract(contractId);
            } catch (err) {
                console.error('Error loading coordination data:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [contractId, recipientId, loadDocumentsByContract, loadFieldsByContract, onPartnerChange]);

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

    const handleEmailBlur = (entryType, entryId, value) => {
        if (isEmailDuplicate(value, entryType, entryId)) {
            setDuplicateWarning(value);
        }
    };

    const handleUpdateReviewer = (id, field, value) => {
        updateReviewer && updateReviewer(id, field, value);
    };

    const handleUpdateSigner = (id, field, value) => {
        updateSigner && updateSigner(id, field, value);
    };

    const handleUpdateClerk = (id, field, value) => {
        updateClerk && updateClerk(id, field, value);
    };

    const mapRecipientForPayload = (recipient) => ({
        id: recipient.id,
        name: recipient.name || recipient.fullName || '',
        email: recipient.email || '',
        phone: recipient.phone || '',
        cardId: recipient.cardId || recipient.card_id || '',
        role: recipient.role,
        ordering: recipient.ordering || 1,
        status: typeof recipient.status === 'number' ? recipient.status : 1,
        signType: recipient.signType === 'hsm' ? 6 : recipient.signType || 6
    });

    const buildParticipantPayload = (newRecipientsPayload) => {
        const participants = [];
        const existingParticipants = Array.isArray(allParticipants) ? allParticipants : [];
        let partnerHandled = false;

        existingParticipants.forEach((participant) => {
            const isPartner = participantInfo?.id && participant.id === participantInfo.id;
            const baseRecipients = (participant.recipients || []).map(mapRecipientForPayload);
            const recipients = isPartner
                ? [...baseRecipients, ...newRecipientsPayload]
                : baseRecipients;

            participants.push({
                name: participant.name || '',
                id: participant.id,
                type: participant.type || 2,
                ordering: participant.ordering || 1,
                status: participant.status ?? 1,
                contractId,
                recipients
            });

            if (isPartner) {
                partnerHandled = true;
            }
        });

        if (!partnerHandled) {
            const existingRecipients = (existingPartnerRecipients || []).map(mapRecipientForPayload);
            participants.push({
                name: partner || participantInfo?.name || 'Đối tác',
                id: participantInfo?.id,
                type: participantInfo?.type || 2,
                ordering: participantInfo?.ordering || 2,
                status: participantInfo?.status ?? 1,
                contractId,
                recipients: [
                    ...existingRecipients,
                    ...newRecipientsPayload
                ]
            });
        }

        return participants;
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

            const signersMissingCardId = signers.filter((signer) => {
                const hasInfo = signer.fullName?.trim() || signer.email?.trim() || signer.phone?.trim();
                if (!hasInfo) return false;
                const cardValue = signer.card_id ?? signer.cardId;
                return !cardValue || !cardValue.toString().trim();
            });

            if (signersMissingCardId.length > 0) {
                setError('Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký.');
                return;
            }

            if (allRecipients.length > 0) {
                try {
                    setLoading(true);
                    setError(null);

                    const newRecipientsPayload = allRecipients.map(person => ({
                        name: person.fullName || person.name || '',
                        email: person.email || '',
                        phone: person.phone || '',
                        cardId: person.cardId || person.card_id || '',
                        role: person.role,
                        ordering: person.ordering || 1,
                        status: 0,
                        signType: person.signType === 'hsm' ? 6 : person.signType || 6
                    }));

                    // Chuẩn bị payload cho API tạo participant (bao gồm tất cả tổ chức)
                    const participantPayload = buildParticipantPayload(newRecipientsPayload);

                    const response = await contractService.createParticipant(contractId, participantPayload);
                    if (response?.code === 'SUCCESS') {
                        // Cập nhật lại danh sách tất cả participants cho step 2
                        const participantsFromResponse = response.data || [];
                        setAllParticipants(participantsFromResponse);

                        // Lưu lại recipients đã được tạo với ID từ backend
                        const newRecipients = participantsFromResponse.flatMap(p => p.recipients || []);
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
                showLockedBadge={false}
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

    const ToastStack = () => (
        <>
            {!!toasts.length && (
                <div className="coordinate-toast-stack">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`coordinate-toast coordinate-toast--${toast.variant}`}
                        >
                            <span>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                aria-label="Close toast"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div className="coordinate-assigners-container">
            <ToastStack />
            {/* Timer */}
            {timer && (
                <div className="coordinate-timer">
                    {timer}
                </div>
            )}

            {duplicateWarning && (
                <div className="coordinate-duplicate-overlay">
                    <div className="coordinate-duplicate-dialog">
                        <h4>Email đã tồn tại</h4>
                        <p>
                            Địa chỉ email <strong>{duplicateWarning}</strong> đã nằm trong danh sách người tham gia của hợp đồng.
                            Vui lòng sử dụng email khác.
                        </p>
                        <button onClick={() => setDuplicateWarning(null)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="coordinate-error-banner" onClick={() => setError(null)}>
                    <div className="coordinate-error-banner__title">Thông báo lỗi</div>
                    <div className="coordinate-error-banner__message">{error}</div>
                    <button
                        className="coordinate-error-banner__close"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setError(null);
                        }}
                    >
                        Đóng
                    </button>
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

            {currentStep === 1 && existingPartnerRecipients.length > 0 && (
                <div className="coordinate-existing-participants">
                    <h4>Người tham gia đã thêm</h4>
                    <div className="coordinate-existing-list">
                        {existingPartnerRecipients.map(recipient => (
                            <div key={recipient.id} className="coordinate-existing-item">
                                <div className="coordinate-existing-name">{recipient.name || '—'}</div>
                                <div className="coordinate-existing-email">{recipient.email || '—'}</div>
                                <div className="coordinate-existing-role">
                                    {recipient.role === 1 ? 'Điều phối' :
                                     recipient.role === 2 ? 'Xem xét' :
                                     recipient.role === 3 ? 'Ký' :
                                     recipient.role === 4 ? 'Văn thư' : 'Khác'}
                                </div>
                            </div>
                        ))}
                    </div>
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
                                                onChange={(e) => handleUpdateReviewer(reviewer.id, 'ordering', parseInt(e.target.value) || 1)}
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
                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="text"
                                                value={reviewer.fullName || ''}
                                                onChange={(e) => handleUpdateReviewer(reviewer.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="email"
                                                value={reviewer.email || ''}
                                                onChange={(e) => handleUpdateReviewer(reviewer.id, 'email', e.target.value)}
                                                onBlur={() => handleEmailBlur('reviewer', reviewer.id, reviewer.email)}
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
                                                onChange={(e) => handleUpdateReviewer(reviewer.id, 'phone', e.target.value)}
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
                                            onChange={() => handleUpdateSigner(signer.id, 'loginByPhone', false)}
                                        />
                                        <span>Đăng nhập bằng email</span>
                                    </label>
                                    <label className="coordinate-radio-option">
                                        <input
                                            type="radio"
                                            name={`signer-login-${signer.id}`}
                                            checked={signer.loginByPhone}
                                            onChange={() => handleUpdateSigner(signer.id, 'loginByPhone', true)}
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
                                                onChange={(e) => handleUpdateSigner(signer.id, 'ordering', parseInt(e.target.value) || 1)}
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
                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="text"
                                                value={signer.fullName || ''}
                                                onChange={(e) => handleUpdateSigner(signer.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>
                                                {signer.loginByPhone ? 'Số điện thoại ' : 'Email '}
                                                <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {signer.loginByPhone ? (
                                                <input
                                                    type="tel"
                                                    value={signer.phone || ''}
                                                    onChange={(e) => handleUpdateSigner(signer.id, 'phone', e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            ) : (
                                                <input
                                                    type="email"
                                                    value={signer.email || ''}
                                                    onChange={(e) => handleUpdateSigner(signer.id, 'email', e.target.value)}
                                                    onBlur={() => handleEmailBlur('signer', signer.id, signer.email)}
                                                    placeholder="Nhập email"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
                                            <select
                                                value={signer.signType || 'hsm'}
                                                onChange={(e) => handleUpdateSigner(signer.id, 'signType', e.target.value)}
                                                className="coordinate-select"
                                            >
                                                <option value="hsm">Chứng thư số server</option>
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
                                                    onChange={(e) => handleUpdateSigner(signer.id, 'phone', e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Mã số thuế/CMT/CCCD <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="text"
                                                value={signer.card_id || signer.cardId || ''}
                                                onChange={(e) => handleUpdateSigner(signer.id, 'card_id', e.target.value)}
                                                placeholder="Nhập Mã số thuế/CMT/CCCD"
                                            />
                                        </div>
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
                                                onChange={(e) => handleUpdateClerk(clerk.id, 'ordering', parseInt(e.target.value) || 1)}
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
                                            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="text"
                                                value={clerk.fullName || ''}
                                                onChange={(e) => handleUpdateClerk(clerk.id, 'fullName', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="coordinate-form-group">
                                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                type="email"
                                                value={clerk.email || ''}
                                                onChange={(e) => handleUpdateClerk(clerk.id, 'email', e.target.value)}
                                                onBlur={() => handleEmailBlur('clerk', clerk.id, clerk.email)}
                                                placeholder="Nhập email"
                                            />
                                        </div>
                                    </div>
                                    <div className="coordinate-form-row">
                                        <div className="coordinate-form-group">
                                            <label>Loại ký <span style={{ color: 'red' }}>*</span></label>
                                            <select
                                                value={clerk.signType || 'hsm'}
                                                onChange={(e) => handleUpdateClerk(clerk.id, 'signType', e.target.value)}
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
                                                onChange={(e) => handleUpdateClerk(clerk.id, 'phone', e.target.value)}
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

