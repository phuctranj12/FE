import React, { useState, useEffect } from 'react';
import '../../styles/documentForm.css';
import TemplateInfoStep from './TemplateInfoStep';
import DocumentSigners from '../createContract/DocumentSigners';
import DocumentEditor from '../createContract/DocumentEditor';
import TemplateConfirmation from './TemplateConfirmation';
import customerService from '../../api/customerService';
import contractService from '../../api/contractService';

const TemplateForm = ({ onBack, editTemplate = null }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const isEdit = !!editTemplate;

    // Flow cố định: tài liệu đơn lẻ không theo mẫu (cho hợp đồng mẫu)
    const documentTypeMode = 'single-no-template';

    // User, tổ chức, loại tài liệu
    const [currentUser, setCurrentUser] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toast
    const [toasts, setToasts] = useState([]);
    const showToast = (message, variant = 'error', durationMs = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, durationMs);
    };
    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Id hợp đồng mẫu + tài liệu PDF
    const [contractId, setContractId] = useState(null);
    const [documentId, setDocumentId] = useState(null);

    // Participants & Fields
    const [participantsData, setParticipantsData] = useState([]);
    const [fieldsData, setFieldsData] = useState([]);
    const [originalFieldsData, setOriginalFieldsData] = useState([]);
    const [unassignedComponentCount, setUnassignedComponentCount] = useState(0);

    // Check mã mẫu (contract_no)
    const [isTemplateCodeValid, setIsTemplateCodeValid] = useState(true);
    const [isCheckingTemplateCode, setIsCheckingTemplateCode] = useState(false);
    const [initialTemplateCode, setInitialTemplateCode] = useState(
        editTemplate?.contractNo ||
            editTemplate?.contractCode ||
            editTemplate?.templateCode ||
            ''
    );

    // Form data cho template
    const [formData, setFormData] = useState(() => ({
        templateName: editTemplate?.name || editTemplate?.templateId || '',
        templateCode: editTemplate?.contractCode || editTemplate?.id || '',
        documentType: editTemplate?.type_id || '',
        startDate: editTemplate?.start_time
            ? editTemplate.start_time.split('T')[0]
            : '',
        endDate: editTemplate?.end_time
            ? editTemplate.end_time.split('T')[0]
            : '',
        attachedFile: '',
        organization:
            editTemplate?.organization_name ||
            editTemplate?.partyA ||
            'Trung tâm công nghệ thông tin MobiFone',
        organizationOrdering: 1,
        message: '',
        // File PDF chính
        pdfFile: null,
        pdfFileName: '',
        pdfPageCount: 0,
        hasSignature: false,
        // File đính kèm khác (nếu cần mở rộng sau)
        attachedFiles: []
    }));

    // Người xử lý
    const [reviewers, setReviewers] = useState([]);
    const [signers, setSigners] = useState([
        {
            id: 1,
            fullName: '',
            email: '',
            loginByPhone: false,
            phone: '',
            card_id: '',
            ordering: 1
        }
    ]);
    const [documentClerks, setDocumentClerks] = useState([]);

    // Đối tác
    const [partners, setPartners] = useState([]);

    const steps = [
        { id: 1, title: 'THÔNG TIN MẪU TÀI LIỆU', active: currentStep === 1 },
        { id: 2, title: 'XÁC ĐỊNH NGƯỜI KÝ', active: currentStep === 2 },
        { id: 3, title: 'THIẾT KẾ MẪU TÀI LIỆU', active: currentStep === 3 },
        { id: 4, title: 'XÁC NHẬN VÀ HOÀN TẤT', active: currentStep === 4 }
    ];

    // Load user + loại tài liệu
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userResponse = await customerService.getCustomerByToken();
                if (userResponse.code === 'SUCCESS' && userResponse.data) {
                    setCurrentUser(userResponse.data);
                    const orgId = userResponse.data.organizationId;
                    setOrganizationId(orgId);

                    setFormData(prev => ({
                        ...prev,
                        organization:
                            prev.organization ||
                            userResponse.data.organizationName ||
                            'Trung tâm công nghệ thông tin MobiFone'
                    }));

                    const typesResponse = await contractService.getAllTypes({
                        page: 0,
                        size: 100,
                        organizationId: orgId
                    });
                    if (typesResponse.code === 'SUCCESS' && typesResponse.data) {
                        setDocumentTypes(typesResponse.data.content || []);
                    }
                } else {
                    throw new Error(
                        userResponse.message ||
                            'Không thể lấy thông tin người dùng'
                    );
                }
            } catch (err) {
                console.error('Error fetching initial data (template):', err);
                const errorMsg =
                    err.message ||
                    'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Load dữ liệu khi sửa hợp đồng mẫu
    useEffect(() => {
        const normalizeFieldFromApi = (field) => ({
            ...field,
            boxX:
                typeof field.boxX === 'number'
                    ? field.boxX
                    : parseFloat(field.boxX) || 0,
            boxY:
                typeof field.boxY === 'number'
                    ? field.boxY
                    : parseFloat(field.boxY) || 0,
            boxW:
                typeof field.boxW === 'number'
                    ? field.boxW
                    : parseFloat(field.boxW) || 0,
            boxH:
                typeof field.boxH === 'string'
                    ? field.boxH
                    : (field.boxH ?? '').toString(),
            font: field.font || 'Times New Roman',
            fontSize: field.fontSize || 11,
            page: field.page ? field.page.toString() : '1',
            status: field.status ?? 0,
            contractId: field.contractId,
            documentId: field.documentId,
            recipientId: field.recipientId || null
        });

        const loadTemplateForEdit = async () => {
            if (!isEdit || !editTemplate) return;

            try {
                setLoading(true);
                setError(null);

                const templateId =
                    editTemplate.id ||
                    editTemplate.contractId ||
                    editTemplate.templateId;
                if (!templateId) {
                    throw new Error('Không xác định được ID mẫu để sửa');
                }

                const contractRes =
                    await contractService.getTemplateContractById(templateId);
                if (contractRes?.code !== 'SUCCESS' || !contractRes?.data) {
                    throw new Error(
                        contractRes?.message ||
                            'Không thể lấy thông tin hợp đồng mẫu'
                    );
                }

                const contract = contractRes.data;
                const cid = contract.id || contract.contractId;
                setContractId(cid);
                setInitialTemplateCode(contract.contractNo || '');
                setIsTemplateCodeValid(true);

                setFormData((prev) => ({
                    ...prev,
                    templateName: contract.name || '',
                    templateCode: contract.contractNo || '',
                    documentType: contract.typeId
                        ? String(contract.typeId)
                        : '',
                    startDate: contract.signTime
                        ? contract.signTime.split('T')[0]
                        : '',
                    endDate: contract.contractExpireTime
                        ? contract.contractExpireTime.split('T')[0]
                        : '',
                    message: contract.note || '',
                    pdfFile: null,
                    pdfFileName: prev.pdfFileName
                }));

                // Documents
                try {
                    const docsRes =
                        await contractService.getTemplateDocumentsByContract(
                            cid
                        );
                    if (docsRes?.code === 'SUCCESS' && Array.isArray(docsRes.data)) {
                        const mainDoc =
                            docsRes.data.find((doc) => doc.type === 1) ||
                            docsRes.data[0];
                        if (mainDoc) {
                            setDocumentId(mainDoc.id);
                            setFormData((prev) => ({
                                ...prev,
                                pdfFileName: mainDoc.fileName || prev.pdfFileName,
                                pdfPageCount: prev.pdfPageCount || 1
                            }));
                        }
                    }
                } catch (docErr) {
                    console.warn('Không thể tải documents của mẫu:', docErr);
                }

                // Participants
                try {
                    const participantsRes =
                        await contractService.getTemplateParticipantsByContract(
                            cid
                        );
                    if (participantsRes?.code === 'SUCCESS' && participantsRes?.data) {
                        const participants = Array.isArray(participantsRes.data)
                            ? participantsRes.data
                            : [];
                        setParticipantsData(participants);

                        // Parse participants thành partners, reviewers, signers, clerks
                        const newReviewers = [];
                        const newSigners = [];
                        const newClerks = [];
                        const newPartners = [];

                        participants.forEach((participant, pIndex) => {
                            const isMyOrg = participant.type === 1;
                            const baseOrdering = participant.ordering || pIndex + 1;

                            (participant.recipients || []).forEach((recipient, rIndex) => {
                                const mapped = {
                                    id: Date.now() + pIndex + rIndex,
                                    recipientId: recipient.id, // Giữ recipientId khi edit
                                    fullName: recipient.name || '',
                                    email: recipient.email || '',
                                    phone: recipient.phone || '',
                                    card_id: recipient.cardId || recipient.card_id || '',
                                    cardId: recipient.cardId || recipient.card_id || '',
                                    ordering: recipient.ordering || rIndex + 1,
                                    loginByPhone: recipient.loginByPhone || false
                                };

                                if (isMyOrg) {
                                    if (recipient.role === 2) newReviewers.push(mapped);
                                    else if (recipient.role === 3) newSigners.push(mapped);
                                    else if (recipient.role === 4) newClerks.push(mapped);
                                } else {
                                    // Partner participants -> push into partners array
                                    let partner = newPartners.find(p => p.participantId === participant.id);
                                    if (!partner) {
                                        partner = {
                                            id: Date.now() + pIndex,
                                            participantId: participant.id,
                                            type: participant.type || 2,
                                            name: participant.name || `Đối tác ${pIndex + 1}`,
                                            ordering: baseOrdering,
                                            coordinators: [],
                                            reviewers: [],
                                            signers: [],
                                            clerks: []
                                        };
                                        newPartners.push(partner);
                                    }

                                    if (recipient.role === 1) partner.coordinators.push(mapped);
                                    else if (recipient.role === 2) partner.reviewers.push(mapped);
                                    else if (recipient.role === 3) partner.signers.push(mapped);
                                    else if (recipient.role === 4) partner.clerks.push(mapped);
                                }
                            });
                        });

                        // Update state với dữ liệu đã parse
                        if (newReviewers.length > 0) setReviewers(newReviewers);
                        if (newSigners.length > 0) setSigners(newSigners);
                        if (newClerks.length > 0) setDocumentClerks(newClerks);
                        if (newPartners.length > 0) setPartners(newPartners);
                    }
                } catch (paErr) {
                    console.warn('Không thể tải participants của mẫu:', paErr);
                }

                // Fields
                try {
                    const fieldsRes =
                        await contractService.getTemplateFieldsByContract(cid);
                    if (fieldsRes?.code === 'SUCCESS' && fieldsRes?.data) {
                        const normalizedFields = Array.isArray(fieldsRes.data)
                            ? fieldsRes.data.map(normalizeFieldFromApi)
                            : [];
                        setFieldsData(normalizedFields);
                        setOriginalFieldsData(normalizedFields);
                    }
                } catch (fieldErr) {
                    console.warn('Không thể tải fields của mẫu:', fieldErr);
                }
            } catch (err) {
                console.error('Error loading template for edit:', err);
                const msg =
                    err.message || 'Không thể tải dữ liệu mẫu để sửa';
                setError(msg);
                showToast(msg, 'error');
            } finally {
                setLoading(false);
            }
        };

        loadTemplateForEdit();
    }, [isEdit, editTemplate]);

    // Khi vào step 2, nếu chưa có tên tổ chức thì gọi chi tiết + load lại participants nếu có
    useEffect(() => {
        const loadStep2Data = async () => {
            if (currentStep === 2) {
                if (organizationId && !formData.organization) {
                    try {
                        const orgResponse =
                            await customerService.getOrganizationById(
                                organizationId
                            );
                        if (orgResponse.code === 'SUCCESS' && orgResponse.data) {
                            setFormData(prev => ({
                                ...prev,
                                organization:
                                    orgResponse.data.name ||
                                    currentUser?.organizationName ||
                                    ''
                            }));
                        }
                    } catch (err) {
                        console.error(
                            'Error loading organization details (template):',
                            err
                        );
                        if (currentUser?.organizationName) {
                            setFormData(prev => ({
                                ...prev,
                                organization: currentUser.organizationName
                            }));
                        }
                    }
                }

                if (participantsData && participantsData.length > 0 && contractId) {
                    try {
                        // Parse tất cả participants, bao gồm cả partners
                        const newReviewers = [];
                        const newSigners = [];
                        const newClerks = [];
                        const newPartners = [];

                        participantsData.forEach((participant, pIndex) => {
                            const isMyOrg = participant.type === 1;
                            const baseOrdering = participant.ordering || pIndex + 1;

                            (participant.recipients || []).forEach((recipient, rIndex) => {
                                const recipientData = {
                                    id: Date.now() + pIndex + rIndex,
                                    recipientId: recipient.id,
                                    fullName: recipient.name || '',
                                    email: recipient.email || '',
                                    phone: recipient.phone || '',
                                    card_id: recipient.card_id || recipient.cardId || '',
                                    cardId: recipient.cardId || recipient.card_id || '',
                                    ordering: recipient.ordering || rIndex + 1,
                                    loginByPhone: recipient.loginByPhone || false
                                };

                                if (isMyOrg) {
                                    if (recipient.role === 2) newReviewers.push(recipientData);
                                    else if (recipient.role === 3) newSigners.push(recipientData);
                                    else if (recipient.role === 4) newClerks.push(recipientData);
                                } else {
                                    // Partner participants -> push into partners array
                                    let partner = newPartners.find(p => p.participantId === participant.id);
                                    if (!partner) {
                                        partner = {
                                            id: Date.now() + pIndex,
                                            participantId: participant.id,
                                            type: participant.type || 2,
                                            name: participant.name || `Đối tác ${pIndex + 1}`,
                                            ordering: baseOrdering,
                                            coordinators: [],
                                            reviewers: [],
                                            signers: [],
                                            clerks: []
                                        };
                                        newPartners.push(partner);
                                    }

                                    if (recipient.role === 1) partner.coordinators.push(recipientData);
                                    else if (recipient.role === 2) partner.reviewers.push(recipientData);
                                    else if (recipient.role === 3) partner.signers.push(recipientData);
                                    else if (recipient.role === 4) partner.clerks.push(recipientData);
                                }
                            });
                        });

                        const hasOnlyEmptySigner =
                            signers.length === 1 &&
                            !signers[0].fullName &&
                            !signers[0].email;

                        const shouldLoad =
                            (newReviewers.length > 0 ||
                                newSigners.length > 0 ||
                                newClerks.length > 0 ||
                                newPartners.length > 0) &&
                            reviewers.length === 0 &&
                            hasOnlyEmptySigner &&
                            documentClerks.length === 0 &&
                            partners.length === 0;

                        if (shouldLoad) {
                            setReviewers(newReviewers);
                            if (newSigners.length > 0) {
                                setSigners(newSigners);
                            }
                            setDocumentClerks(newClerks);
                            if (newPartners.length > 0) {
                                setPartners(newPartners);
                            }
                        }

                        // Set organization ordering từ participant đầu tiên (tổ chức của tôi)
                        const firstParticipant = participantsData.find(p => p.type === 1);
                        if (firstParticipant && firstParticipant.ordering) {
                            setFormData(prev => ({
                                ...prev,
                                organizationOrdering: firstParticipant.ordering
                            }));
                        }
                    } catch (err) {
                        console.error(
                            'Error loading participants data (template):',
                            err
                        );
                    }
                }
            }
        };

        loadStep2Data();
    }, [currentStep, organizationId, formData.organization, participantsData, contractId, reviewers.length, signers, documentClerks.length, currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Kiểm tra mã mẫu tài liệu unique (dùng lại API check-code-unique)
    const handleTemplateCodeBlur = async () => {
        const code = formData.templateCode?.trim();

        if (!code) {
            setIsTemplateCodeValid(false);
            return;
        }

        if (isEdit && code === initialTemplateCode) {
            setIsTemplateCodeValid(true);
            return;
        }

        try {
            setIsCheckingTemplateCode(true);
            const response = await contractService.checkTemplateCodeUnique(code);

            if (response.code === 'SUCCESS') {
                let isUnique = false;

                if (typeof response.data === 'boolean') {
                    isUnique = response.data === true;
                } else if (response.data && typeof response.data === 'object') {
                    const isExist = response.data.isExist;
                    if (typeof isExist === 'string') {
                        isUnique = isExist.toLowerCase() === 'false';
                    } else {
                        isUnique = !isExist;
                    }
                }

                setIsTemplateCodeValid(isUnique);
                if (!isUnique) {
                    showToast(
                        'Mã mẫu tài liệu đã tồn tại. Vui lòng nhập mã khác.',
                        'error'
                    );
                }
            } else {
                showToast(
                    response.message || 'Không thể kiểm tra mã mẫu tài liệu',
                    'error'
                );
                setIsTemplateCodeValid(false);
            }
        } catch (err) {
            console.error('Error checking template code:', err);
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                'Đã xảy ra lỗi khi kiểm tra mã mẫu tài liệu';
            showToast(errorMsg, 'error');
            setIsTemplateCodeValid(false);
        } finally {
            setIsCheckingTemplateCode(false);
        }
    };

    // Upload file PDF, gọi getPageSize + checkSignature
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Chỉ hỗ trợ file PDF', 'error');
            return;
        }

        try {
            setLoading(true);

            const pageSizeResponse = await contractService.getPageSize(file);
            if (pageSizeResponse.code !== 'SUCCESS') {
                throw new Error(
                    pageSizeResponse.message ||
                        'Không thể kiểm tra số trang của file'
                );
            }

            const pageCount = pageSizeResponse.data?.numberOfPages || 0;

            const signatureResponse = await contractService.checkSignature(file);
            if (signatureResponse.code !== 'SUCCESS') {
                throw new Error(
                    signatureResponse.message ||
                        'Không thể kiểm tra chữ ký số'
                );
            }

            const hasSignature = signatureResponse.data?.hasSignature || false;
            if (hasSignature) {
                showToast(
                    'Tài liệu đã có chữ ký số, vui lòng chọn file khác',
                    'error'
                );
                e.target.value = '';
                return;
            }

            setFormData(prev => ({
                ...prev,
                pdfFile: file,
                pdfFileName: file.name,
                pdfPageCount: parseInt(pageCount, 10),
                hasSignature
            }));
        } catch (err) {
            console.error('Error uploading template file:', err);
            showToast(
                err.message || 'Đã xảy ra lỗi khi tải file. Vui lòng thử lại.',
                'error'
            );
            e.target.value = '';
        } finally {
            setLoading(false);
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
        setReviewers(prev => [...prev, newReviewer]);
    };

    const addSigner = () => {
        const newSigner = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            loginByPhone: false,
            card_id: '',
            ordering: signers.length + 1
        };
        setSigners(prev => [...prev, newSigner]);
    };

    const addDocumentClerk = () => {
        const newClerk = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            card_id: '',
            ordering: documentClerks.length + 1
        };
        setDocumentClerks(prev => [...prev, newClerk]);
    };

    const updateSigner = (id, field, value) => {
        setSigners(prev =>
            prev.map(signer =>
                signer.id === id ? { ...signer, [field]: value } : signer
            )
        );
    };

    const removeSigner = (id) => {
        if (signers.length > 1) {
            setSigners(prev => prev.filter(signer => signer.id !== id));
        }
    };

    const updateReviewer = (id, field, value) => {
        setReviewers(prev =>
            prev.map(reviewer =>
                reviewer.id === id ? { ...reviewer, [field]: value } : reviewer
            )
        );
    };

    const removeReviewer = (id) => {
        setReviewers(prev => prev.filter(reviewer => reviewer.id !== id));
    };

    const updateDocumentClerk = (id, field, value) => {
        setDocumentClerks(prev =>
            prev.map(clerk =>
                clerk.id === id ? { ...clerk, [field]: value } : clerk
            )
        );
    };

    const removeDocumentClerk = (id) => {
        setDocumentClerks(prev => prev.filter(clerk => clerk.id !== id));
    };

    // Đối tác (rút gọn từ DocumentForm)
    const addPartner = () => {
        const newPartner = {
            id: Date.now(),
            type: 2,
            name: '',
            ordering: partners.length + 2,
            coordinators: [],
            reviewers: [],
            signers: [],
            clerks: []
        };
        setPartners(prev => [...prev, newPartner]);
    };

    const removePartner = (id) => {
        setPartners(prev => prev.filter(partner => partner.id !== id));
    };

    const updatePartner = (id, field, value) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === id) {
                    if (field === 'type' && value === 3) {
                        return {
                            ...partner,
                            type: 3,
                            coordinators: [],
                            reviewers: [],
                            clerks: []
                        };
                    }
                    return { ...partner, [field]: value };
                }
                return partner;
            })
        );
    };

    // Partner coordinator functions
    const addPartnerCoordinator = (partnerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    const newCoordinator = {
                        id: Date.now(),
                        fullName: '',
                        email: '',
                        phone: '',
                        card_id: '',
                        ordering: partner.coordinators.length + 1
                    };
                    return {
                        ...partner,
                        coordinators: [...partner.coordinators, newCoordinator]
                    };
                }
                return partner;
            })
        );
    };

    const updatePartnerCoordinator = (partnerId, coordinatorId, field, value) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        coordinators: partner.coordinators.map(coordinator =>
                            coordinator.id === coordinatorId
                                ? { ...coordinator, [field]: value }
                                : coordinator
                        )
                    };
                }
                return partner;
            })
        );
    };

    const removePartnerCoordinator = (partnerId, coordinatorId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        coordinators: partner.coordinators.filter(c => c.id !== coordinatorId)
                    };
                }
                return partner;
            })
        );
    };

    // Partner reviewer functions
    const addPartnerReviewer = (partnerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    const newReviewer = {
                        id: Date.now(),
                        fullName: '',
                        email: '',
                        phone: '',
                        card_id: '',
                        ordering: partner.reviewers.length + 1
                    };
                    return {
                        ...partner,
                        reviewers: [...partner.reviewers, newReviewer]
                    };
                }
                return partner;
            })
        );
    };

    const updatePartnerReviewer = (partnerId, reviewerId, field, value) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        reviewers: partner.reviewers.map(reviewer =>
                            reviewer.id === reviewerId
                                ? { ...reviewer, [field]: value }
                                : reviewer
                        )
                    };
                }
                return partner;
            })
        );
    };

    const removePartnerReviewer = (partnerId, reviewerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        reviewers: partner.reviewers.filter(r => r.id !== reviewerId)
                    };
                }
                return partner;
            })
        );
    };

    const addPartnerSigner = (partnerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    const newSigner = {
                        id: Date.now(),
                        fullName: '',
                        email: '',
                        phone: '',
                        loginByPhone: false,
                        card_id: '',
                        ordering: partner.signers.length + 1
                    };
                    return {
                        ...partner,
                        signers: [...partner.signers, newSigner]
                    };
                }
                return partner;
            })
        );
    };

    const updatePartnerSigner = (partnerId, signerId, field, value) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        signers: partner.signers.map(signer =>
                            signer.id === signerId
                                ? { ...signer, [field]: value }
                                : signer
                        )
                    };
                }
                return partner;
            })
        );
    };

    const removePartnerSigner = (partnerId, signerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        signers: partner.signers.filter(
                            s => s.id !== signerId
                        )
                    };
                }
                return partner;
            })
        );
    };

    // Partner clerk functions
    const addPartnerClerk = (partnerId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    const newClerk = {
                        id: Date.now(),
                        fullName: '',
                        email: '',
                        phone: '',
                        card_id: '',
                        ordering: partner.clerks.length + 1
                    };
                    return {
                        ...partner,
                        clerks: [...partner.clerks, newClerk]
                    };
                }
                return partner;
            })
        );
    };

    const updatePartnerClerk = (partnerId, clerkId, field, value) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        clerks: partner.clerks.map(clerk =>
                            clerk.id === clerkId
                                ? { ...clerk, [field]: value }
                                : clerk
                        )
                    };
                }
                return partner;
            })
        );
    };

    const removePartnerClerk = (partnerId, clerkId) => {
        setPartners(prev =>
            prev.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        clerks: partner.clerks.filter(c => c.id !== clerkId)
                    };
                }
                return partner;
            })
        );
    };

    const handleOrganizationOrderingChange = (value) => {
        const parsed = parseInt(value, 10);
        setFormData(prev => ({
            ...prev,
            organizationOrdering: Number.isNaN(parsed)
                ? ''
                : Math.max(1, parsed)
        }));
    };

    const validateEmail = (email) => {
        if (!email) return false;
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email.trim());
    };

    const validatePhone = (phone) => {
        if (!phone) return false;
        const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
        return phoneRegex.test(phone.trim().replace(/\s/g, ''));
    };

    const validateStep2 = () => {
        const errors = [];

        if (!contractId) {
            errors.push(
                'Không tìm thấy thông tin hợp đồng mẫu. Vui lòng hoàn thành bước 1 trước.'
            );
        }

        const validSigners = signers.filter((signer) => {
            const hasName = signer.fullName?.trim();
            if (!hasName) return false;

            if (signer.loginByPhone) {
                return validatePhone(signer.phone);
            }
            return validateEmail(signer.email);
        });

        if (validSigners.length === 0) {
            errors.push(
                'Vui lòng thêm ít nhất một người ký với tên và email/số điện thoại hợp lệ.'
            );
        }

        const invalidSigners = signers.filter((signer) => {
            if (!signer.fullName?.trim()) return false;
            if (signer.loginByPhone) {
                return !validatePhone(signer.phone);
            }
            return !validateEmail(signer.email);
        });
        if (invalidSigners.length > 0) {
            errors.push('Email hoặc số điện thoại của người ký không hợp lệ.');
        }

        const signersWithoutCardId = signers.filter((signer) => {
            const hasName = signer.fullName?.trim();
            if (!hasName) return false;
            const cardId = signer.cardId || signer.card_id || '';
            return !cardId.trim();
        });
        if (signersWithoutCardId.length > 0) {
            errors.push(
                'Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký.'
            );
        }

        const incompleteReviewers = reviewers.filter((reviewer) =>
            reviewer.fullName !== undefined &&
            reviewer.email !== undefined &&
            (!reviewer.fullName?.trim() || !reviewer.email?.trim())
        );
        if (incompleteReviewers.length > 0) {
            errors.push(
                'Vui lòng nhập đầy đủ Họ tên và Email cho tất cả người xem xét.'
            );
        }

        const invalidReviewers = reviewers.filter(
            (reviewer) => reviewer.email && !validateEmail(reviewer.email)
        );
        if (invalidReviewers.length > 0) {
            errors.push('Email của người xem xét không hợp lệ.');
        }

        const incompleteClerks = documentClerks.filter((clerk) =>
            clerk.fullName !== undefined &&
            clerk.email !== undefined &&
            (!clerk.fullName?.trim() || !clerk.email?.trim())
        );
        if (incompleteClerks.length > 0) {
            errors.push(
                'Vui lòng nhập đầy đủ Họ tên và Email cho tất cả văn thư.'
            );
        }

        const invalidClerks = documentClerks.filter(
            (clerk) => clerk.email && !validateEmail(clerk.email)
        );
        if (invalidClerks.length > 0) {
            errors.push('Email của văn thư không hợp lệ.');
        }

        partners.forEach((partner, index) => {
            if (!partner.name?.trim()) {
                errors.push(`Vui lòng nhập tên cho đối tác ${index + 1}.`);
                return;
            }

            // Validate coordinators
            const incompleteCoordinators = partner.coordinators?.filter((coord) =>
                coord.fullName !== undefined &&
                coord.email !== undefined &&
                (!coord.fullName?.trim() || !coord.email?.trim())
            ) || [];
            if (incompleteCoordinators.length > 0) {
                errors.push(
                    `Vui lòng nhập đầy đủ Họ tên và Email cho tất cả người điều phối trong đối tác "${partner.name}".`
                );
            }

            const invalidCoordinators = partner.coordinators?.filter(
                (coord) => coord.email && !validateEmail(coord.email)
            ) || [];
            if (invalidCoordinators.length > 0) {
                errors.push(`Email của người điều phối trong đối tác "${partner.name}" không hợp lệ.`);
            }

            // Validate reviewers
            const incompletePartnerReviewers = partner.reviewers?.filter((reviewer) =>
                reviewer.fullName !== undefined &&
                reviewer.email !== undefined &&
                (!reviewer.fullName?.trim() || !reviewer.email?.trim())
            ) || [];
            if (incompletePartnerReviewers.length > 0) {
                errors.push(
                    `Vui lòng nhập đầy đủ Họ tên và Email cho tất cả người xem xét trong đối tác "${partner.name}".`
                );
            }

            const invalidPartnerReviewers = partner.reviewers?.filter(
                (reviewer) => reviewer.email && !validateEmail(reviewer.email)
            ) || [];
            if (invalidPartnerReviewers.length > 0) {
                errors.push(`Email của người xem xét trong đối tác "${partner.name}" không hợp lệ.`);
            }

            // Validate signers
            const validatePartnerSigners = (signersList) => {
                const invalid = signersList.filter((signer) => {
                    if (!signer.fullName?.trim()) return false;
                    if (signer.loginByPhone) {
                        return !validatePhone(signer.phone);
                    }
                    return !validateEmail(signer.email);
                });
                if (invalid.length > 0) {
                    errors.push(
                        `Email hoặc số điện thoại của người ký trong đối tác "${partner.name}" không hợp lệ.`
                    );
                }

                const withoutCardId = signersList.filter((signer) => {
                    const hasName = signer.fullName?.trim();
                    if (!hasName) return false;
                    const cardId = signer.cardId || signer.card_id || '';
                    return !cardId.trim();
                });
                if (withoutCardId.length > 0) {
                    errors.push(
                        `Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký trong đối tác "${partner.name}".`
                    );
                }
            };

            if (partner.type === 2 || partner.type === 3) {
                validatePartnerSigners(partner.signers || []);
            }

            // Validate clerks
            const incompletePartnerClerks = partner.clerks?.filter((clerk) =>
                clerk.fullName !== undefined &&
                clerk.email !== undefined &&
                (!clerk.fullName?.trim() || !clerk.email?.trim())
            ) || [];
            if (incompletePartnerClerks.length > 0) {
                errors.push(
                    `Vui lòng nhập đầy đủ Họ tên và Email cho tất cả văn thư trong đối tác "${partner.name}".`
                );
            }

            const invalidPartnerClerks = partner.clerks?.filter(
                (clerk) => clerk.email && !validateEmail(clerk.email)
            ) || [];
            if (invalidPartnerClerks.length > 0) {
                errors.push(`Email của văn thư trong đối tác "${partner.name}" không hợp lệ.`);
            }
        });

        if (errors.length > 0) {
            showToast(errors[0], 'error');
            return false;
        }

        return true;
    };

    const buildParticipantsPayload = () => {
        const participants = [];

        const addRecipients = (items, role, recipientsArray) => {
            const validItems = items.filter(item => {
                const fullName = item.fullName?.trim();
                if (!fullName) return false;

                if (role === 3 && item.loginByPhone) {
                    const phone = item.phone?.trim();
                    return phone && validatePhone(phone);
                }
                const email = item.email?.trim();
                return email && validateEmail(email);
            });

            validItems.forEach((item, index) => {
                const customOrdering = parseInt(item.ordering, 10);
                const ordering =
                    Number.isNaN(customOrdering) || customOrdering <= 0
                        ? index + 1
                        : customOrdering;

                const email =
                    role === 3 && item.loginByPhone
                        ? ''
                        : item.email?.trim() || '';
                const phone =
                    role === 3 && item.loginByPhone
                        ? item.phone?.trim() || ''
                        : item.phone || '';

                const cardId =
                    role === 3 ? item.cardId || item.card_id || '' : '';

                recipientsArray.push({
                    ...(item.recipientId && { id: item.recipientId }),
                    name: item.fullName.trim(),
                    email,
                    phone,
                    cardId,
                    role,
                    ordering,
                    status: 0,
                    signType: 6
                });
            });
        };

        const myOrgRecipients = [];
        addRecipients(reviewers, 2, myOrgRecipients);
        addRecipients(signers, 3, myOrgRecipients);
        addRecipients(documentClerks, 4, myOrgRecipients);

        if (myOrgRecipients.length > 0) {
            const participantName =
                formData.organization?.trim() || 'Tổ chức của tôi';
            const participantOrdering = parseInt(
                formData.organizationOrdering,
                10
            );
            const orderingValue =
                Number.isNaN(participantOrdering) || participantOrdering <= 0
                    ? 1
                    : participantOrdering;

            const participantPayload = {
                ...(participantsData?.[0]?.id && {
                    id: participantsData[0].id
                }),
                name: participantName,
                type: 1,
                ordering: orderingValue,
                status: 1,
                contractId,
                recipients: myOrgRecipients
            };
            participants.push(participantPayload);
        }

        partners.forEach((partner) => {
            if (!partner.name?.trim()) return;

            const partnerRecipients = [];
            addRecipients(partner.coordinators, 1, partnerRecipients); // Thêm coordinators
            addRecipients(partner.reviewers, 2, partnerRecipients); // Thêm reviewers
            addRecipients(partner.signers, 3, partnerRecipients);
            addRecipients(partner.clerks, 4, partnerRecipients); // Thêm clerks

            if (partnerRecipients.length > 0) {
                const partnerOrdering = parseInt(partner.ordering, 10);
                const orderingValue =
                    Number.isNaN(partnerOrdering) || partnerOrdering <= 0
                        ? participants.length + 1
                        : partnerOrdering;

                const partnerPayload = {
                    ...(partner.participantId && { id: partner.participantId }),
                    name: partner.name.trim(),
                    type: partner.type,
                    ordering: orderingValue,
                    status: 1,
                    contractId,
                    recipients: partnerRecipients
                };
                participants.push(partnerPayload);
            }
        });

        return participants;
    };

    const validateStep1 = () => {
        const errors = [];

        if (!formData.templateName?.trim()) {
            errors.push('Tên mẫu tài liệu là bắt buộc');
        }

        if (!formData.templateCode?.trim()) {
            errors.push('Mã mẫu tài liệu là bắt buộc');
        }

        if (
            formData.templateCode &&
            formData.templateCode.trim() &&
            !isTemplateCodeValid
        ) {
            errors.push(
                'Mã mẫu tài liệu đã tồn tại. Vui lòng nhập mã khác.'
            );
        }

        if (!formData.startDate) {
            errors.push('Ngày bắt đầu hiệu lực là bắt buộc');
        }

        if (!formData.endDate) {
            errors.push('Ngày kết thúc hiệu lực là bắt buộc');
        }

        if (!formData.pdfFile) {
            if (!isEdit || (isEdit && !documentId)) {
                errors.push('Vui lòng tải lên file PDF mẫu tài liệu');
            }
        }

        if (errors.length > 0) {
            showToast(errors[0], 'error');
            return false;
        }

        return true;
    };

    const convertToISODateFromDateInput = (dateStr) => {
        if (!dateStr) return null;
        return `${dateStr}T00:00:00.000Z`;
    };

    const handleNext = () => {
        handleNextAsync();
    };

    const handleNextAsync = async () => {
        if (currentStep === 1) {
            if (!validateStep1()) return;

            try {
                setLoading(true);

                const contractData = {
                    name: formData.templateName.trim(),
                    contractNo: formData.templateCode?.trim() || '',
                    signTime: convertToISODateFromDateInput(formData.startDate),
                    note: formData.message?.trim() || '',
                    typeId: formData.documentType
                        ? parseInt(formData.documentType, 10)
                        : 0,
                    isTemplate: true,
                    contractExpireTime:
                        convertToISODateFromDateInput(formData.endDate)
                };

                let currentContractId = contractId;
                let currentDocumentId = documentId;

                if (isEdit && currentContractId) {
                    const updateResponse =
                        await contractService.updateTemplateContract(
                            currentContractId,
                            contractData
                        );
                    if (updateResponse.code !== 'SUCCESS') {
                        throw new Error(
                            updateResponse.message ||
                                'Không thể cập nhật hợp đồng mẫu'
                        );
                    }
                } else {
                    const contractResponse =
                        await contractService.createTemplateContract(
                            contractData
                        );

                    if (
                        contractResponse.code !== 'SUCCESS' ||
                        !contractResponse.data?.id
                    ) {
                        throw new Error(
                            contractResponse.message ||
                                'Không thể tạo hợp đồng mẫu'
                        );
                    }

                    currentContractId = contractResponse.data.id;
                    setContractId(currentContractId);
                }

                // Upload file chính nếu user chọn file mới
                let lastUploadedFileName = formData.pdfFileName;

                if (formData.pdfFile) {
                    const uploadResponse =
                        await contractService.uploadTemplateDocument(
                            formData.pdfFile
                        );

                    if (
                        uploadResponse.code !== 'SUCCESS' ||
                        !uploadResponse.data
                    ) {
                        throw new Error(
                            uploadResponse.message || 'Không thể upload file PDF'
                        );
                    }

                    const { path: uploadedPath, fileName: uploadedFileName } =
                        uploadResponse.data;
                    lastUploadedFileName = uploadedFileName;

                    const documentData = {
                        name: formData.templateName.trim(),
                        type: 1,
                        contractId: currentContractId,
                        fileName: uploadedFileName,
                        path: uploadedPath,
                        status: 1
                    };

                    const documentResponse =
                        await contractService.createTemplateDocument(
                            documentData
                        );

                    if (
                        documentResponse.code !== 'SUCCESS' ||
                        !documentResponse.data?.id
                    ) {
                        throw new Error(
                            documentResponse.message ||
                                'Không thể lưu thông tin tài liệu'
                        );
                    }

                    currentDocumentId = documentResponse.data.id;
                    setDocumentId(currentDocumentId);
                    setFormData((prev) => ({
                        ...prev,
                        pdfFile: null,
                        pdfFileName: uploadedFileName
                    }));
                } else if (!currentDocumentId) {
                    throw new Error('Vui lòng tải lên file PDF mẫu tài liệu');
                }

                // Upload file đính kèm nếu có (type = 3)
                if (formData.attachedFiles && formData.attachedFiles.length > 0) {
                    for (const file of formData.attachedFiles) {
                        try {
                            const attachUploadResponse =
                                await contractService.uploadDocument(file);

                            if (
                                attachUploadResponse.code === 'SUCCESS' &&
                                attachUploadResponse.data
                            ) {
                                const attachDocData = {
                                    name: file.name,
                                    type: 3,
                                    contractId: currentContractId,
                                    fileName: attachUploadResponse.data.fileName,
                                    path: attachUploadResponse.data.path,
                                    status: 1
                                };

                                await contractService.createTemplateDocument(
                                    attachDocData
                                );
                            }
                        } catch (err) {
                            console.error(
                                'Error uploading attached file for template:',
                                file.name,
                                err
                            );
                        }
                    }

                    setFormData((prev) => ({
                        ...prev,
                        attachedFiles: [],
                        attachedFile: ''
                    }));
                }

                if (isEdit) {
                    showToast(
                        'Cập nhật thông tin mẫu tài liệu thành công!',
                        'success',
                        3000
                    );
                }

                setCurrentStep(2);
            } catch (err) {
                console.error('Error in template step 1:', err);
                showToast(
                    err.message ||
                        'Không thể lưu thông tin bước 1. Vui lòng thử lại.',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 2) {
            if (!validateStep2()) return;

            const participantsPayload = buildParticipantsPayload();
            if (!participantsPayload || participantsPayload.length === 0) {
                showToast(
                    'Vui lòng nhập thông tin người xử lý trước khi tiếp tục.',
                    'error'
                );
                return;
            }

            try {
                setLoading(true);
                const participantResponse =
                    await contractService.createTemplateParticipant(
                        contractId,
                        participantsPayload
                    );

                if (participantResponse.code !== 'SUCCESS') {
                    throw new Error(
                        participantResponse.message ||
                            'Không thể lưu người xử lý'
                    );
                }

                setParticipantsData(participantResponse.data || []);
                showToast(
                    'Lưu thông tin người xử lý thành công.',
                    'success',
                    3000
                );
                setCurrentStep(3);
            } catch (err) {
                console.error('Error saving participants (template):', err);
                const errorMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    'Không thể lưu người xử lý. Vui lòng thử lại.';
                showToast(errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 3) {
            if (unassignedComponentCount > 0) {
                showToast(
                    `Vui lòng gán người xử lý cho ${unassignedComponentCount} thành phần trước khi tiếp tục.`,
                    'error'
                );
                return;
            }
            setCurrentStep(4);
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
    };

    const handleComplete = async () => {
        if (!contractId || !documentId) {
            showToast(
                'Không tìm thấy thông tin hợp đồng mẫu. Vui lòng quay lại bước 1.',
                'error'
            );
            return;
        }

        if (!fieldsData || fieldsData.length === 0) {
            showToast(
                'Vui lòng thiết kế ít nhất một field trên tài liệu ở bước 3.',
                'error'
            );
            return;
        }

        try {
            setLoading(true);

            if (!isEdit) {
                const fieldsResponse = await contractService.createTemplateField(
                    fieldsData
                );
                if (fieldsResponse.code !== 'SUCCESS') {
                    throw new Error(
                        fieldsResponse.message || 'Không thể tạo fields cho mẫu'
                    );
                }
            } else {
                const toCreate = [];
                const toUpdate = [];

                fieldsData.forEach((field) => {
                    const payload = {
                        name: field.name,
                        font: field.font || 'Times New Roman',
                        fontSize: field.fontSize || 11,
                        boxX: field.boxX ?? field.x ?? 0,
                        boxY: field.boxY ?? field.y ?? 0,
                        page: field.page ? field.page.toString() : '1',
                        ordering: field.ordering ?? 0,
                        boxW: field.boxW ?? field.width ?? 0,
                        boxH: (field.boxH ?? field.height ?? '30').toString(),
                        contractId,
                        documentId: field.documentId || documentId,
                        type: field.type || 1,
                        recipientId: field.recipientId || null,
                        status: field.status ?? 0
                    };

                    if (field.id) {
                        toUpdate.push({ id: field.id, payload });
                    } else {
                        toCreate.push(payload);
                    }
                });

                if (toCreate.length > 0) {
                    const createRes = await contractService.createTemplateField(
                        toCreate
                    );
                    if (createRes.code !== 'SUCCESS') {
                        throw new Error(
                            createRes.message || 'Không thể tạo field mới'
                        );
                    }
                }

                for (const item of toUpdate) {
                    const updateRes =
                        await contractService.updateTemplateField(
                            item.id,
                            item.payload
                        );
                    if (updateRes.code !== 'SUCCESS') {
                        throw new Error(
                            updateRes.message ||
                                'Không thể cập nhật field hiện có'
                        );
                    }
                }
                // TODO: Nếu backend hỗ trợ delete field, so sánh originalFieldsData để xóa
            }

            const statusResponse = await contractService.changeTemplateContractStatus(
                contractId,
                10
            );
            if (statusResponse.code !== 'SUCCESS') {
                throw new Error(
                    statusResponse.message ||
                        'Không thể cập nhật trạng thái hợp đồng mẫu'
                );
            }

            showToast(
                isEdit
                    ? 'Cập nhật mẫu tài liệu thành công.'
                    : 'Tạo hợp đồng mẫu thành công với trạng thái "Đã tạo".',
                'success',
                5000
            );

            setTimeout(() => {
                onBack && onBack();
            }, 1500);
        } catch (err) {
            console.error('Error completing template:', err);
            showToast(
                err.message ||
                    'Không thể hoàn tất hợp đồng mẫu. Vui lòng thử lại.',
                'error'
            );
        } finally {
            setLoading(false);
        }
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
                documentTypes={documentTypes}
                loading={loading}
                handleInputChange={handleInputChange}
                handleFileUpload={handleFileUpload}
                handleAttachedFilesUpload={handleAttachedFilesUpload}
                removeAttachedFile={removeAttachedFile}
                onTemplateCodeBlur={handleTemplateCodeBlur}
                isCheckingTemplateCode={isCheckingTemplateCode}
                isTemplateCodeValid={isTemplateCodeValid}
            />
        );
    };

    // Gợi ý tên cho step 2 (giống DocumentForm)
    const suggestName = async (textSearch) => {
        try {
            const searchText = textSearch?.trim() || '';
            const response = await customerService.suggestListCustomer(
                searchText
            );
            if (response.code === 'SUCCESS' && response.data) {
                return response.data
                    .map(item => ({
                        name: item.name || '',
                        email: item.email || '',
                        phone: item.phone || ''
                    }))
                    .filter(item => item.name);
            }
            return [];
        } catch (err) {
            console.error('Error fetching name suggestions (template):', err);
            return [];
        }
    };

    const renderStep2 = () => {
        return (
            <DocumentSigners
                documentType={documentTypeMode}
                formData={formData}
                setFormData={setFormData}
                reviewers={reviewers}
                addReviewer={addReviewer}
                updateReviewer={updateReviewer}
                removeReviewer={removeReviewer}
                signers={signers}
                addSigner={addSigner}
                removeSigner={removeSigner}
                updateSigner={updateSigner}
                documentClerks={documentClerks}
                addDocumentClerk={addDocumentClerk}
                updateDocumentClerk={updateDocumentClerk}
                removeDocumentClerk={removeDocumentClerk}
                handleOrganizationOrderingChange={handleOrganizationOrderingChange}
                suggestName={suggestName}
                partners={partners}
                addPartner={addPartner}
                removePartner={removePartner}
                updatePartner={updatePartner}
                addPartnerCoordinator={addPartnerCoordinator}
                updatePartnerCoordinator={updatePartnerCoordinator}
                removePartnerCoordinator={removePartnerCoordinator}
                addPartnerReviewer={addPartnerReviewer}
                updatePartnerReviewer={updatePartnerReviewer}
                removePartnerReviewer={removePartnerReviewer}
                addPartnerSigner={addPartnerSigner}
                updatePartnerSigner={updatePartnerSigner}
                removePartnerSigner={removePartnerSigner}
                addPartnerClerk={addPartnerClerk}
                updatePartnerClerk={updatePartnerClerk}
                removePartnerClerk={removePartnerClerk}
            />
        );
    };

    const renderStep3 = () => {
        return (
            <DocumentEditor
                documentType={documentTypeMode}
                contractId={contractId}
                documentId={documentId}
                participantsData={participantsData}
                fieldsData={fieldsData}
                onFieldsChange={setFieldsData}
                totalPages={formData.pdfPageCount || 1}
                onBack={() => setCurrentStep(2)}
                onNext={() => setCurrentStep(4)}
                onSaveDraft={() => {
                    console.log('Lưu nháp từ TemplateForm');
                }}
                hideFooter={true}
                onAssignmentStateChange={setUnassignedComponentCount}
                isTemplateDocument={true}
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
                contractId={contractId}
                documentId={documentId}
                fieldsData={fieldsData}
                loading={loading}
                onBack={() => setCurrentStep(3)}
                onComplete={handleComplete}
                onSaveDraft={handleSaveDraft}
            />
        );
    };

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

    if (error && !currentUser) {
        return (
            <div className="document-form-container">
                <div className="document-form-wrapper">
                    <div className="error-message">
                        <p>❌ {error}</p>
                        <button onClick={() => window.location.reload()}>
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {!!toasts.length && (
                <div
                    style={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 10000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}
                >
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
                                borderRadius: 8,
                                color:
                                    t.variant === 'success'
                                        ? '#0a3622'
                                        : '#842029',
                                background:
                                    t.variant === 'success'
                                        ? '#d1e7dd'
                                        : '#f8d7da',
                                border: `1px solid ${
                                    t.variant === 'success'
                                        ? '#a3cfbb'
                                        : '#f5c2c7'
                                }`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow:
                                    '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <span style={{ flex: 1 }}>{t.message}</span>
                            <button
                                onClick={() => removeToast(t.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    marginLeft: 12,
                                    padding: 0,
                                    color: 'inherit',
                                    opacity: 0.7,
                                    lineHeight: 1
                                }}
                                aria-label="Close toast"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="document-form-container">
                <div className="document-form-wrapper">
                    <div className="form-header">
                        <div className="step-indicator">
                            {steps.map((step) => {
                                const isCompleted = step.id < currentStep;
                                const isActive = step.active;
                                return (
                                    <div
                                        key={step.id}
                                        className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                    >
                                        <div
                                            className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                        >
                                            {step.id}
                                        </div>
                                        <div className="step-title">
                                            {step.title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-body">
                        {loading && currentUser && (
                            <div className="loading-overlay">
                                Đang xử lý...
                            </div>
                        )}
                        {renderStepContent()}
                    </div>

                    <div className="form-footer">
                        {currentStep > 1 && currentStep < 4 && (
                            <button
                                className="back-btn"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                Quay lại
                            </button>
                        )}
                        {currentStep === 1 && (
                            <button
                                className="back-btn"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                Quay lại
                            </button>
                        )}
                        {currentStep < 4 && (
                            <div className="footer-right">
                                <button
                                    className="save-draft-btn"
                                    onClick={handleSaveDraft}
                                    disabled={loading}
                                >
                                    Lưu nháp
                                </button>
                                <button
                                    className="next-btn"
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TemplateForm;