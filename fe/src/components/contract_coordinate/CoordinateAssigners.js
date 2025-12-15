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

    const fetchLatestParticipants = useCallback(async () => {
        if (!contractId) return [];
        try {
            const res = await contractService.getAllParticipantsByContract(contractId);
            if (res?.code === 'SUCCESS') {
                const participants = res.data || [];
                setAllParticipants(participants);
                return participants;
            }
        } catch (err) {
            console.error('Error refreshing participants before coordinate:', err);
        }
        return Array.isArray(allParticipants) ? allParticipants : [];
    }, [contractId, allParticipants]);

    const getLatestRecipients = useCallback(async () => {
        const participants = await fetchLatestParticipants();
        const recipientList = Array.isArray(participants)
            ? participants.flatMap((p) => p.recipients || [])
            : [];
        if (recipientList.length > 0) {
            setCreatedRecipients(recipientList);
        }
        return recipientList;
    }, [fetchLatestParticipants]);

    const mapRecipient = useCallback((entry = {}, role) => ({
        id: entry.id || entry.recipientId || `${role}-${entry.email || entry.phone || Date.now()}`,
        name: entry.fullName || entry.name || '',
        email: entry.email || '',
        phone: entry.phone || '',
        role,
        ordering: entry.ordering || 1
    }), []);

    const participantsForConfirmation = useMemo(() => {
        if (Array.isArray(allParticipants) && allParticipants.length > 0) {
            return allParticipants;
        }

        const fallbackParticipants = [];

        // Partner (đối tác) – dùng reviewers/signers/clerks nhập ở step 1
        const partnerRecipients = [
            ...reviewers.map((r) => mapRecipient(r, 2)),
            ...signers.map((s) => mapRecipient(s, 3)),
            ...clerks.map((c) => mapRecipient(c, 4))
        ].filter((r) => r.name || r.email || r.phone);

        if (partnerRecipients.length > 0) {
            fallbackParticipants.push({
                id: 'partner-fallback',
                name: partner || participantInfo?.name || 'Đối tác',
                type: 2,
                recipients: partnerRecipients
            });
        }

        // Tổ chức của tôi (điều phối)
        const myOrgRecipients = [];
        if (coordinatorRecipient) {
            myOrgRecipients.push({
                id: coordinatorRecipient.id || 'coordinator-fallback',
                name: coordinatorRecipient.name || '',
                email: coordinatorRecipient.email || '',
                phone: coordinatorRecipient.phone || '',
                role: 1,
                ordering: coordinatorRecipient.ordering || 1
            });
        }

        fallbackParticipants.unshift({
            id: 'my-org-fallback',
            name: participantInfo?.name || 'Tổ chức của tôi',
            type: 1,
            recipients: myOrgRecipients
        });

        return fallbackParticipants;
    }, [allParticipants, reviewers, signers, clerks, partner, participantInfo, coordinatorRecipient, mapRecipient]);

    const getRecipientsByRole = (recipients = [], role) =>
        recipients.filter((r) => Number(r.role) === role);

    const isSignerLocked = (signer = {}) => Boolean(signer.recipientId);

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
                await loadDocumentsByContract(contractId);
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

    const mapRecipientForPayload = (recipient) => {
        const payload = {
            name: recipient.name || recipient.fullName || '',
            email: recipient.email || '',
            phone: recipient.phone || '',
            cardId: recipient.cardId || recipient.card_id || '',
            role: recipient.role,
            ordering: recipient.ordering || 1,
            status: typeof recipient.status === 'number' ? recipient.status : 1,
            signType: recipient.signType === 'hsm' ? 6 : recipient.signType || 6
        };
        
        // Chỉ include id nếu nó là recipientId từ backend (không phải id tạm từ Date.now())
        // recipientId có nghĩa là existing recipient cần update
        // Nếu không có recipientId thì đây là recipient mới, không gửi id
        if (recipient.id && (recipient.recipientId || recipient.id === recipient.recipientId)) {
            payload.id = recipient.id;
        }
        
        return payload;
    };

    const buildParticipantPayload = (newRecipientsPayload) => {
        // Helper function to dedup recipients by id or email+role
        // Ưu tiên giữ entry có id (existing) thay vì entry mới không có id
        const dedupRecipients = (recipientsList) => {
            const byEmail = new Map(); // email+role -> recipient
            const byId = new Map(); // id -> recipient
            
            recipientsList.forEach(r => {
                if (r.id) {
                    // Nếu có id, lưu vào byId
                    byId.set(r.id, r);
                }
                // Luôn lưu vào byEmail để check duplicate
                const emailKey = `${(r.email || '').toLowerCase()}-${r.role}`;
                if (!byEmail.has(emailKey) || !byEmail.get(emailKey).id) {
                    // Chỉ update nếu chưa có hoặc existing không có id (ưu tiên entry có id)
                    byEmail.set(emailKey, r);
                }
            });
            
            // Merge kết quả: ưu tiên byId, sau đó byEmail
            const result = new Map();
            byId.forEach((r, id) => {
                result.set(id, r);
            });
            byEmail.forEach((r, emailKey) => {
                if (!r.id) {
                    // Chỉ thêm entry không có id nếu chưa có email+role này trong result
                    const exists = Array.from(result.values()).some(
                        existing => existing.email?.toLowerCase() === r.email?.toLowerCase() && existing.role === r.role
                    );
                    if (!exists) {
                        result.set(emailKey, r);
                    }
                }
            });
            
            return Array.from(result.values());
        };

        const participants = [];
        const existingParticipants = Array.isArray(allParticipants) ? allParticipants : [];

        // Dedup participants by id (or name-type fallback) to avoid duplicate org entries
        const uniqueParticipants = [];
        const participantKeySet = new Set();
        existingParticipants.forEach((p) => {
            const key = p.id || `${p.name || ''}-${p.type || ''}`;
            if (!participantKeySet.has(key)) {
                participantKeySet.add(key);
                uniqueParticipants.push(p);
            }
        });

        let partnerHandled = false;
        const myOrgName = participantInfo?.name; // Tên tổ chức của user
        const myOrgParticipantIds = new Set(); // Track các participant IDs đã xử lý

        uniqueParticipants.forEach((participant) => {
            const isPartner = participantInfo?.id && participant.id === participantInfo.id;
            const isMyOrg = participant.name === myOrgName; // Cùng tổ chức với user (so sánh theo tên)
            
            // Check isPartner TRƯỚC để tránh duplicate khi partner cũng là myOrg
            if (isPartner) {
                // Xử lý partner đang điều phối: signers từ state là source of truth
                const existingNonSignerRecipients = (participant.recipients || [])
                    .filter(r => r.role !== 3) // Loại bỏ existing signers
                    .map(mapRecipientForPayload);
                
                const signersFromState = signers.map(s => {
                    const signerData = {
                        name: s.fullName || s.name || '',
                        email: s.email || '',
                        phone: s.phone || '',
                        cardId: s.cardId || s.card_id || '',
                        role: 3, // Role 3: Ký
                        ordering: s.ordering || 1,
                        status: typeof s.status === 'number' ? s.status : 0,
                        signType: s.signType === 'hsm' ? 6 : s.signType || 6
                    };
                    // Chỉ include id nếu có recipientId (existing recipient từ backend)
                    if (s.recipientId) {
                        signerData.id = s.recipientId;
                    }
                    return signerData;
                });
                
                // Dedup recipients to avoid duplicates
                const recipients = dedupRecipients([
                    ...existingNonSignerRecipients,
                    ...signersFromState,
                    ...newRecipientsPayload
                ]);

                participants.push({
                    name: participant.name || '',
                    id: participant.id,
                    type: participant.type || 2,
                    ordering: participant.ordering || 1,
                    status: participant.status ?? 1,
                    contractId,
                    recipients
                });
                
                partnerHandled = true;
                // Nếu partner cũng là myOrg thì đánh dấu luôn
                if (isMyOrg) {
                    myOrgParticipantIds.add(participant.id);
                }
            } else if (isMyOrg) {
                // Xử lý tổ chức của user: signers từ state là source of truth
                // Loại bỏ TẤT CẢ existing signers (role = 3) và thay thế bằng signers từ state
                const existingNonSignerRecipients = (participant.recipients || [])
                    .filter(r => r.role !== 3) // Loại bỏ existing signers
                    .map(mapRecipientForPayload);
                
                // Lấy signers từ state (bao gồm cả existing và mới)
                // Nếu signer có recipientId thì đó là existing signer cần update (gửi id)
                // Nếu không có recipientId thì đó là signer mới cần tạo (không gửi id)
                const signersFromState = signers.map(s => {
                    const signerData = {
                        name: s.fullName || s.name || '',
                        email: s.email || '',
                        phone: s.phone || '',
                        cardId: s.cardId || s.card_id || '',
                        role: 3, // Role 3: Ký
                        ordering: s.ordering || 1,
                        status: typeof s.status === 'number' ? s.status : 0,
                        signType: s.signType === 'hsm' ? 6 : s.signType || 6
                    };
                    // Chỉ include id nếu có recipientId (existing recipient từ backend)
                    if (s.recipientId) {
                        signerData.id = s.recipientId;
                    }
                    return signerData;
                });
                
                // Dedup recipients to avoid duplicates
                const recipients = dedupRecipients([
                    ...existingNonSignerRecipients,
                    ...signersFromState
                ]);

                participants.push({
                    name: participant.name || '',
                    id: participant.id,
                    type: participant.type || 1,
                    ordering: participant.ordering || 1,
                    status: participant.status ?? 1,
                    contractId,
                    recipients
                });

                if (isPartner) {
                    partnerHandled = true;
                }
            } else {
                // Các participant khác: giữ nguyên nhưng vẫn dedup
                const baseRecipients = (participant.recipients || []).map(mapRecipientForPayload);
                const recipients = dedupRecipients(baseRecipients);
                
                participants.push({
                    name: participant.name || '',
                    id: participant.id,
                    type: participant.type || 2,
                    ordering: participant.ordering || 1,
                    status: participant.status ?? 1,
                    contractId,
                    recipients
                });
            }
        });

        // Nếu chưa có tổ chức của user trong participants, tạo mới
        if (myOrgParticipantIds.size === 0 && signers.length > 0) {
            const signersFromState = signers.map(s => {
                const signerData = {
                    ...s,
                    name: s.fullName || s.name || '',
                    fullName: s.fullName || s.name || '',
                    role: 3
                };
                if (s.recipientId) {
                    signerData.id = s.recipientId;
                }
                return mapRecipientForPayload(signerData);
            });
            
            participants.push({
                name: myOrgName || partner || 'Tổ chức của tôi',
                type: participantInfo?.type || 1,
                ordering: participantInfo?.ordering || 1,
                status: participantInfo?.status ?? 1,
                contractId,
                recipients: signersFromState
            });
        }

        // Nếu chưa có đối tác trong participants, tạo mới
        if (!partnerHandled) {
            const existingRecipients = (existingPartnerRecipients || []).map(mapRecipientForPayload);
            // Helper function to dedup recipients
            const dedupRecipients = (recipientsList) => {
                const seen = new Map();
                recipientsList.forEach(r => {
                    const key = r.id || `${(r.email || '').toLowerCase()}-${r.role}`;
                    if (!seen.has(key)) {
                        seen.set(key, r);
                    }
                });
                return Array.from(seen.values());
            };
            
            const recipients = dedupRecipients([
                ...existingRecipients,
                ...newRecipientsPayload
            ]);
            
            participants.push({
                name: partner || participantInfo?.name || 'Đối tác',
                id: participantInfo?.id,
                type: participantInfo?.type || 2,
                ordering: participantInfo?.ordering || 2,
                status: participantInfo?.status ?? 1,
                contractId,
                recipients
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

        try {
            setLoading(true);
            setError(null);

            // Làm mới recipients để tránh gửi id stale (optimistic locking)
            const refreshedRecipients = await getLatestRecipients();
            const recipientsForCoordinate = refreshedRecipients.length > 0
                ? refreshedRecipients
                : createdRecipients;

            if (!recipientsForCoordinate || recipientsForCoordinate.length === 0) {
                setError('Vui lòng thêm và lưu người tham gia trước khi điều phối');
                return;
            }

            // Chuẩn bị dữ liệu điều phối
            // Phần tử đầu tiên: Người điều phối hiện tại (từ coordinatorDetail)
            const coordinator = coordinatorDetail;

            if (!coordinator) {
                setError('Không tìm thấy thông tin người điều phối hiện tại');
                return;
            }

            // Chuẩn hóa danh sách recipients cho participant hiện tại: gửi toàn bộ tuyến xử lý mong muốn,
            // không gửi id cũ để tránh stale, và ép participantId khớp với path param.
            // KHÔNG gửi người điều phối (role 1) trong body, chỉ gửi roles 2/3/4.
            const normalizedRecipients = (recipientsForCoordinate || [])
                .filter(r =>
                    r &&
                    Number(r.role) !== 1 && // bỏ coordinator khỏi body
                    ((r.participantId == null) || Number(r.participantId) === Number(currentParticipantId))
                )
                .map((r, idx) => ({
                    ...(r.id ? { id: r.id } : {}),
                    name: r.fullName || r.name || '',
                    email: r.email || '',
                    phone: r.phone || '',
                    role: Number(r.role),
                    ordering: r.ordering || idx + 1,
                    status: typeof r.status === 'number' ? r.status : 0,
                    signType: r.signType === 'hsm' ? 6 : (r.signType || 6),
                    username: r.username || null,
                    password: r.password || null,
                    cardId: r.cardId || r.card_id || '',
                    delegateTo: r.delegateTo || null,
                    signStart: r.signStart || null,
                    signEnd: r.signEnd || null,
                    fields: r.fields || [],
                    participantId: currentParticipantId
                }))
                .filter(r => r.role && (r.name || r.email || r.phone));

            // Body chỉ gồm recipients (role 2/3/4), không kèm coordinator
            const recipientsData = normalizedRecipients;

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
            // Validate người ký: LUÔN bắt buộc phải có ít nhất 1 người ký hợp lệ
            // (kể cả khi điều phối và xóa đi người ký đã được thêm vào trước đó)
            const validSigners = signers.filter((signer) => {
                const hasName = signer.fullName?.trim();
                if (!hasName) return false;
                
                if (signer.loginByPhone) {
                    return signer.phone?.trim() && /^[0-9]{10,11}$/.test(signer.phone.trim());
                } else {
                    return signer.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email.trim());
                }
            });

            if (validSigners.length === 0) {
                setError('Vui lòng thêm ít nhất một người ký hợp lệ.');
                return;
            }

            // Validate Mã số thuế/CMT/CCCD cho các người ký mới
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
            { id: 1, title: 'XÁC ĐỊNH NGƯỜI XỬ LÝ TÀI LIỆU' },
            { id: 2, title: 'THIẾT KẾ TÀI LIỆU' },
            { id: 3, title: 'XÁC NHẬN THÔNG TIN TÀI LIỆU' }
        ];

        return (
            <div className="coordinate-step-indicator">
                {steps.map((step) => {
                    const isStepActive = currentStep >= step.id; // Step hiện tại và các step trước
                    const isStepCompleted = currentStep > step.id; // Đã đi qua step này

                    return (
                        <div
                            key={step.id}
                            className={`coordinate-step ${isStepActive ? 'active' : ''} ${isStepCompleted ? 'completed' : ''}`}
                        >
                            <div
                                className={`coordinate-step-circle ${isStepActive ? 'active' : ''} ${isStepCompleted ? 'completed' : ''}`}
                            >
                                {step.id}
                            </div>
                            <div className="coordinate-step-title">{step.title}</div>
                        </div>
                    );
                })}
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
        const renderRoleSection = (label, recipients = []) => (
            <div className="coordinate-confirmation-field">
                <label>{label}</label>
                <div className="coordinate-confirmation-value-list">
                    {recipients.length > 0 ? (
                        recipients.map((r, idx) => (
                            <div key={r.id || idx}>
                                {r.name || '—'}
                                {r.email ? ` - ${r.email}` : r.phone ? ` - ${r.phone}` : ''}
                            </div>
                        ))
                    ) : (
                        <span>—</span>
                    )}
                </div>
            </div>
        );

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
                    {participantsForConfirmation && participantsForConfirmation.length > 0 ? (
                        participantsForConfirmation.map((participant) => {
                            const recipients = participant?.recipients || [];
                            const title =
                                participant.type === 1
                                    ? 'TỔ CHỨC CỦA TÔI'
                                    : participant.type === 3
                                    ? 'CÁ NHÂN'
                                    : 'ĐỐI TÁC';

                            return (
                                <div className="coordinate-party-card" key={participant.id || participant.name}>
                                    <div className="coordinate-party-header">
                                        <span className="coordinate-party-title">
                                            {participant.name || title}
                                        </span>
                                        <span className="coordinate-party-subtitle">{title}</span>
                                    </div>
                                    <div className="coordinate-party-body">
                                        {renderRoleSection('Người điều phối', getRecipientsByRole(recipients, 1))}
                                        {renderRoleSection('Người xem xét', getRecipientsByRole(recipients, 2))}
                                        {renderRoleSection('Người ký', getRecipientsByRole(recipients, 3))}
                                        {renderRoleSection('Văn thư', getRecipientsByRole(recipients, 4))}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="coordinate-confirmation-field">
                            <label>Người tham gia</label>
                            <div className="coordinate-confirmation-value">Không có dữ liệu người tham gia</div>
                        </div>
                    )}
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
                        signers.map((signer, index) => {
                            const locked = isSignerLocked(signer);
                            return (
                                <div key={signer.id || index} className="coordinate-participant-card">
                                    {/* Login Method Radio Buttons */}
                                    <div className="coordinate-login-method">
                                        <label className="coordinate-radio-option">
                                            <input
                                                type="radio"
                                                name={`signer-login-${signer.id}`}
                                                checked={!signer.loginByPhone}
                                                onChange={() => handleUpdateSigner(signer.id, 'loginByPhone', false)}
                                                disabled={locked}
                                            />
                                            <span>Đăng nhập bằng email</span>
                                        </label>
                                        <label className="coordinate-radio-option">
                                            <input
                                                type="radio"
                                                name={`signer-login-${signer.id}`}
                                                checked={signer.loginByPhone}
                                                onChange={() => handleUpdateSigner(signer.id, 'loginByPhone', true)}
                                                disabled={locked}
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
                                                    disabled={locked}
                                                />
                                            </div>
                                            <h4>Người ký {index + 1}</h4>
                                        </div>
                                        <button 
                                            className="coordinate-remove-btn"
                                            onClick={() => removeSigner && removeSigner(signer.id)}
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
                                                    value={signer.fullName || ''}
                                                    onChange={(e) => handleUpdateSigner(signer.id, 'fullName', e.target.value)}
                                                    placeholder="Nhập họ và tên"
                                                    disabled={locked}
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
                                                        disabled={locked}
                                                    />
                                                ) : (
                                                    <input
                                                        type="email"
                                                        value={signer.email || ''}
                                                        onChange={(e) => handleUpdateSigner(signer.id, 'email', e.target.value)}
                                                        onBlur={() => handleEmailBlur('signer', signer.id, signer.email)}
                                                        placeholder="Nhập email"
                                                        disabled={locked}
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
                                                    disabled={locked}
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
                                                        disabled={locked}
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
                                                    disabled={locked}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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

