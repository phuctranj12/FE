import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/documentForm.css';
import DocumentTypeSelection from './DocumentTypeSelection';
import DocumentSigners from './DocumentSigners';
import DocumentEditor from './DocumentEditor';
import DocumentConfirmation from './DocumentConfirmation';
import customerService from '../../api/customerService';
import contractService from '../../api/contractService';

const DocumentForm = ({ initialData = null, isEdit = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    // Nếu có templateId từ location.state, set documentType = 'single-template'
    const templateIdFromState = location.state?.templateId;
    // Nếu có copyFromContractId từ location.state, set documentType = 'single-template' và isCopy = true
    const copyFromContractId = location.state?.copyFromContractId;
    const isCopy = location.state?.isCopy || false;
    const [documentType, setDocumentType] = useState(
        templateIdFromState || copyFromContractId ? 'single-template' : 'single-no-template'
    );

    // User and Organization data
    const [currentUser, setCurrentUser] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [relatedContracts, setRelatedContracts] = useState([]);
    const [documentTemplates, setDocumentTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    const showToast = (message, variant = 'error', durationMs = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Contract and Document IDs (saved after API calls)
    const [contractId, setContractId] = useState(null);
    const [documentId, setDocumentId] = useState(null);
    const [participantsData, setParticipantsData] = useState([]);
    const [fieldsData, setFieldsData] = useState([]); // Lưu fields data từ bước 3
    const [unassignedComponentCount, setUnassignedComponentCount] = useState(0);
    const [isDocumentNumberValid, setIsDocumentNumberValid] = useState(true);
    const [isCheckingDocumentNumber, setIsCheckingDocumentNumber] = useState(false);

    const getDefaultExpirationDate = () => {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 5);
        const day = String(expirationDate.getDate()).padStart(2, '0');
        const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
        const year = expirationDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [formData, setFormData] = useState({
        documentName: '',
        documentNumber: '',
        documentTemplate: templateIdFromState || '',
        documentType: '',
        relatedDocuments: '',
        message: '',
        expirationDate: getDefaultExpirationDate(),
        signingExpirationDate: getDefaultExpirationDate(),
        attachedFile: '',
        uploadToMinistry: 'Không',
        templateFile: '',
        organization: '',
        organizationOrdering: 1,
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

    // Set documentTemplate khi có templateId từ location state
    useEffect(() => {
        if (templateIdFromState && !formData.documentTemplate) {
            setFormData(prev => ({
                ...prev,
                documentTemplate: templateIdFromState
            }));
        }
    }, [templateIdFromState]);

    // Set documentTemplate khi có copyFromContractId (dùng contractId như templateId để tái sử dụng flow)
    useEffect(() => {
        if (copyFromContractId && !formData.documentTemplate) {
            setFormData(prev => ({
                ...prev,
                documentTemplate: copyFromContractId
            }));
        }
    }, [copyFromContractId]);

    useEffect(() => {
        if (initialData && isEdit) {
            // Lưu contractId để dùng cho các bước tiếp theo
            if (initialData.id || initialData.contractId) {
                setContractId(initialData.id || initialData.contractId);
            }

            // Map thông tin cơ bản
            setFormData(prev => ({
                ...prev,
                documentName: initialData.name || '',
                documentNumber: initialData.contractNo || '',
                message: initialData.note || '',
                documentType: initialData.typeId || '',
                expirationDate: initialData.contractExpireTime?.split('T')[0] || '',
                organizationOrdering: initialData.participants?.[0]?.ordering || 1
            }));

            // Map participants
            const participants = initialData.participants || [];
            const newReviewers = [];
            const newSigners = [];
            const newClerks = [];

            participants.forEach(participant => {
                (participant.recipients || []).forEach(recipient => {
                    const data = {
                        id: recipient.id,
                        recipientId: recipient.id,
                        fullName: recipient.name || '',
                        email: recipient.email || '',
                        phone: recipient.phone || '',
                        card_id: recipient.cardId || recipient.card_id || '',
                        ordering: recipient.ordering,
                        loginByPhone: recipient.loginByPhone || false
                    };

                    if (recipient.role === 2) newReviewers.push(data);
                    else if (recipient.role === 3) newSigners.push(data);
                    else if (recipient.role === 4) newClerks.push(data);
                });
            });

            setReviewers(newReviewers);
            setSigners(newSigners.length ? newSigners : [{ id: 1, fullName: '', email: '', ordering: 1 }]);
            setDocumentClerks(newClerks);
        }
    }, [initialData, isEdit]);




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

    // Partners state - array of partner objects
    const [partners, setPartners] = useState([]);

    // Template metadata & loading state
    const [templateMeta, setTemplateMeta] = useState(null);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

    const downloadTemplatePdf = async (url, fileName = 'template.pdf') => {
        const res = await axios.get(url, { responseType: 'blob' });
        const mime = res.headers['content-type'] || 'application/pdf';
        return new File([res.data], fileName, { type: mime });
    };

    const normalizeFieldFromApi = (field, fallbackDocumentId = null) => ({
        id: field.id,
        name: field.name || field.label || '',
        font: field.font || 'Times New Roman',
        fontSize: field.fontSize || 11,
        boxX: field.boxX ?? field.x ?? 0,
        boxY: field.boxY ?? field.y ?? 0,
        page: field.page ? field.page.toString() : '1',
        ordering: field.ordering ?? 0,
        boxW: field.boxW ?? field.w ?? field.width ?? 100,
        boxH: (field.boxH ?? field.h ?? field.height ?? '30').toString(),
        contractId: field.contractId || contractId,
        documentId: field.documentId || fallbackDocumentId || documentId,
        type: field.type || 1,
        recipientId: field.recipientId || field.recipient?.id || null,
        status: field.status ?? 0,
        value: field.value || ''
    });

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

                    // 4. Gọi API lấy danh sách tài liệu mẫu
                    const templatesResponse = await contractService.getMyTemplateContracts({
                        page: 0,
                        size: 100
                    });

                    if (templatesResponse.code === 'SUCCESS' && templatesResponse.data) {
                        const payload = templatesResponse.data?.data || templatesResponse.data || {};
                        const templatesList = payload.content || payload.items || payload || [];
                        setDocumentTemplates(templatesList);
                    }
                } else {
                    throw new Error(userResponse.message || 'Không thể lấy thông tin người dùng');
                }

            } catch (err) {
                console.error('Error fetching initial data:', err);
                const errorMsg = err.message || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Load dữ liệu hợp đồng để chỉnh sửa (contract đã tạo)
    useEffect(() => {
        if (!isEdit || !initialData) return;

        const cid = initialData.id || initialData.contractId;
        if (!cid) return;

        const loadContractForEdit = async () => {
            try {
                setLoading(true);

                const [documentsRes, participantsRes, fieldsRes] = await Promise.all([
                    contractService.getDocumentsByContract(cid),
                    contractService.getParticipantsByContract(cid),
                    contractService.getFieldsByContract(cid)
                ]);

                const documents = Array.isArray(documentsRes?.data) ? documentsRes.data : [];
                const participants = Array.isArray(participantsRes?.data) ? participantsRes.data : [];
                const fields = Array.isArray(fieldsRes?.data) ? fieldsRes.data : [];

                const mainDoc = documents.find(doc => doc.type === 1) || documents[0];
                if (mainDoc?.id) {
                    setDocumentId(mainDoc.id);
                }

                // Prefill participants data for step 2/3
                setParticipantsData(participants);

                if (fields.length > 0) {
                    const mappedFields = fields.map(f => normalizeFieldFromApi(f, mainDoc?.id));
                    setFieldsData(mappedFields);
                }

                // Download PDF hiện tại nếu có
                if (mainDoc?.id) {
                    let pdfUrl = null;
                    try {
                        const presignedRes = await contractService.getPresignedUrl(mainDoc.id);
                        if (presignedRes?.code === 'SUCCESS') {
                            pdfUrl =
                                typeof presignedRes.data === 'string'
                                    ? presignedRes.data
                                    : presignedRes.data?.url || presignedRes.data?.message || presignedRes.url;
                        }
                    } catch (err) {
                        console.warn('[Edit] Không lấy được presigned URL của hợp đồng', err);
                    }

                    if (pdfUrl) {
                        const fileName = mainDoc.fileName || mainDoc.name || 'document.pdf';
                        const file = await downloadTemplatePdf(pdfUrl, fileName);
                        let pageCount = mainDoc.pageCount || formData.pdfPageCount || 0;

                        try {
                            const pageSizeResponse = await contractService.getPageSize(file);
                            if (pageSizeResponse?.code === 'SUCCESS') {
                                pageCount = pageSizeResponse?.data?.numberOfPages || pageCount;
                            }
                        } catch (err) {
                            console.warn('[Edit] Không lấy được pageSize khi tải hợp đồng', err);
                        }

                        setFormData(prev => ({
                            ...prev,
                            pdfFile: file,
                            pdfFileName: file.name,
                            pdfPageCount: pageCount || 0,
                            hasSignature: false,
                            attachedFile: file.name,
                            documentTemplate: prev.documentTemplate || initialData.templateContractId || '',
                            documentType: prev.documentType || initialData.typeId || ''
                        }));
                    }
                }
            } catch (err) {
                console.error('Error loading contract for edit:', err);
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Không thể tải dữ liệu hợp đồng để chỉnh sửa.';
                showToast(message, 'error');
            } finally {
                setLoading(false);
            }
        };

        loadContractForEdit();
    }, [isEdit, initialData]);

    // Load template details + prefill when choose template in single-template mode
    // Hoặc load contract details khi copy từ contract
    useEffect(() => {
        let cancelled = false;

        const loadTemplate = async () => {
            if (documentType !== 'single-template' || !formData.documentTemplate) {
                setTemplateMeta(null);
                return;
            }

            // Định nghĩa isCopyMode ở đầu hàm để có thể sử dụng trong toàn bộ scope
            const templateId = formData.documentTemplate;
            const isCopyMode = isCopy && copyFromContractId === templateId;

            try {
                setIsLoadingTemplate(true);

                // Nếu là copy mode, sử dụng contract API; nếu không, sử dụng template API
                const [
                    templateRes,
                    participantsRes,
                    fieldsRes,
                    documentsRes
                ] = await Promise.all([
                    isCopyMode 
                        ? contractService.getContractById(templateId)
                        : contractService.getTemplateContractById(templateId),
                    isCopyMode
                        ? contractService.getParticipantsByContract(templateId)
                        : contractService.getTemplateParticipantsByContract(templateId),
                    isCopyMode
                        ? contractService.getFieldsByContract(templateId)
                        : contractService.getTemplateFieldsByContract(templateId),
                    isCopyMode
                        ? contractService.getDocumentsByContract(templateId)
                        : contractService.getTemplateDocumentsByContract(templateId)
                ]);

                if (templateRes?.code !== 'SUCCESS' || !templateRes?.data) {
                    throw new Error(templateRes?.message || (isCopyMode ? 'Không thể tải thông tin hợp đồng' : 'Không thể tải thông tin mẫu'));
                }

                const template = templateRes.data;
                const templateParticipants = Array.isArray(participantsRes?.data) ? participantsRes.data : [];
                const templateFields = Array.isArray(fieldsRes?.data) ? fieldsRes.data : [];
                const templateDocuments = Array.isArray(documentsRes?.data) ? documentsRes.data : [];

                // Lấy document chính:
                // - type = 1: File gốc (dùng để copy/tải xuống)
                // - type = 2: File đã ký (dùng để view/hiển thị cho người dùng)
                // Khi copy contract hoặc tạo từ template, cần lấy type = 1 để download và copy
                const mainDoc =
                    templateDocuments.find(doc => doc.type === 1) ||
                    templateDocuments[0];

                let templatePdfUrl = null;
                let templatePageCount = mainDoc?.pageCount || template?.pageCount || 0;
                let templateFileName = mainDoc?.fileName || template?.fileName || template?.templateName || template?.name || (isCopyMode ? 'document.pdf' : 'template.pdf');

                if (mainDoc?.id) {
                    try {
                        // Nếu là copy mode, sử dụng getPresignedUrl (contract document);
                        // nếu không, sử dụng getTemplateDocumentPresignedUrl (template document)
                        // Cả hai đều lấy document có type = 1 (file gốc) để copy/tải xuống
                        const presignedRes = isCopyMode
                            ? await contractService.getPresignedUrl(mainDoc.id)
                            : await contractService.getTemplateDocumentPresignedUrl(mainDoc.id);
                        if (presignedRes?.code === 'SUCCESS') {
                            templatePdfUrl =
                                typeof presignedRes.data === 'string'
                                    ? presignedRes.data
                                    : presignedRes.data?.url || presignedRes.data?.message || presignedRes.url;
                        }
                    } catch (err) {
                        console.warn(isCopyMode ? '[Copy]' : '[Template]', 'Không lấy được presigned URL, fallback path', err);
                        templatePdfUrl = mainDoc?.path || null;
                    }
                }

                if (!templatePdfUrl) {
                    throw new Error(isCopyMode ? 'Không tìm thấy file PDF của hợp đồng' : 'Không tìm thấy file PDF của mẫu');
                }

                // Download PDF as File object
                const file = await downloadTemplatePdf(templatePdfUrl, templateFileName || 'template.pdf');

                // Get page size (prefer API result)
                try {
                    const pageSizeResponse = await contractService.getPageSize(file);
                    if (pageSizeResponse?.code === 'SUCCESS') {
                        templatePageCount = pageSizeResponse?.data?.numberOfPages || templatePageCount || 0;
                    }
                } catch (err) {
                    console.warn('[Template] Không lấy được pageSize', err);
                }

                // Check signature but always keep hasSignature=false
                try {
                    await contractService.checkSignature(file);
                } catch (err) {
                    console.warn('[Template] checkSignature lỗi, bỏ qua', err);
                }

                if (cancelled) return;

                setTemplateMeta({
                    template,
                    participants: templateParticipants,
                    fields: templateFields,
                    document: mainDoc,
                    templatePdfUrl,
                    pageCount: templatePageCount,
                    fileName: templateFileName
                });

                // Prefill basic form only when empty
                setFormData(prev => ({
                    ...prev,
                    pdfFile: file,
                    pdfFileName: file.name,
                    pdfPageCount: templatePageCount || 0,
                    hasSignature: false,
                    attachedFile: file.name,
                    documentName: prev.documentName || template?.templateName || template?.name || '',
                    // Khi copy, không copy documentNumber (để user nhập mới)
                    documentNumber: isCopyMode ? prev.documentNumber : (prev.documentNumber || template?.templateNo || ''),
                    signingExpirationDate: prev.signingExpirationDate || template?.signingExpireDefault || getDefaultExpirationDate(),
                    expirationDate: prev.expirationDate || template?.expireDefault || getDefaultExpirationDate(),
                    documentType: template?.typeId || prev.documentType
                }));

                // Prefill participants only if user has not filled
                const hasUserReviewers = reviewers.length > 0;
                const hasUserClerks = documentClerks.length > 0;
                const hasUserSigners = !(
                    signers.length === 1 &&
                    !signers[0].fullName &&
                    !signers[0].email &&
                    !signers[0].phone
                );

                if (!hasUserReviewers && !hasUserClerks && !hasUserSigners && templateParticipants.length > 0) {
                    const newReviewers = [];
                    const newSigners = [];
                    const newClerks = [];
                    const newPartners = [];

                    templateParticipants.forEach((participant, pIndex) => {
                        const isMyOrg = participant.type === 1;
                        const baseOrdering = participant.ordering || pIndex + 1;

                        (participant.recipients || []).forEach((recipient, rIndex) => {
                            const mapped = {
                                id: Date.now() + pIndex + rIndex,
                                // KHÔNG set recipientId khi tạo mới từ template
                                // recipientId chỉ dùng khi edit và recipient đã tồn tại trong hợp đồng này
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
                                // Khi copy, không copy participantId (tạo mới)
                                const partnerKey = isCopyMode ? `partner-${pIndex}` : participant.id;
                                let partner = newPartners.find(p => 
                                    isCopyMode ? p.tempKey === partnerKey : p.participantId === participant.id
                                );
                                if (!partner) {
                                    partner = {
                                        id: Date.now() + pIndex,
                                        // KHÔNG set participantId khi copy (tạo mới)
                                        ...(isCopyMode ? {} : { participantId: participant.id }),
                                        ...(isCopyMode ? { tempKey: partnerKey } : {}),
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

                    setReviewers(newReviewers);
                    setSigners(newSigners.length ? newSigners : signers);
                    setDocumentClerks(newClerks);
                    setPartners(newPartners);
                }

                // Prefill fields only when empty
                if (!fieldsData || fieldsData.length === 0) {
                    const mappedFields = templateFields.map((field, index) => ({
                        id: field.id,
                        name: field.name || field.label || '',
                        font: field.font || 'Times New Roman',
                        fontSize: field.fontSize || 11,
                        boxX: field.boxX ?? field.x ?? 0,
                        boxY: field.boxY ?? field.y ?? 0,
                        page: field.page ? field.page.toString() : '1',
                        ordering: field.ordering ?? index + 1,
                        boxW: field.boxW ?? field.w ?? field.width ?? 100,
                        boxH: (field.boxH ?? field.h ?? field.height ?? '30').toString(),
                        contractId: null,
                        documentId: null,
                        type: field.type || 1,
                        // Khi copy, reset recipientId (không copy recipientId từ contract cũ)
                        recipientId: isCopyMode ? null : (field.recipientId || null),
                        status: field.status ?? 0
                    }));
                    setFieldsData(mappedFields);
                }
            } catch (err) {
                console.error(isCopyMode ? '[Copy]' : '[Template]', 'Lỗi tải', isCopyMode ? 'hợp đồng' : 'mẫu', err);
                if (!cancelled) {
                    showToast(err.message || (isCopyMode ? 'Không thể tải hợp đồng để sao chép. Vui lòng thử lại.' : 'Không thể tải mẫu. Vui lòng thử lại hoặc chọn file thủ công.'), 'error');
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingTemplate(false);
                }
            }
        };

        loadTemplate();

        return () => {
            cancelled = true;
        };
        // Loại bỏ fieldsData khỏi dependency để tránh infinite loop
        // fieldsData được check bên trong useEffect với điều kiện if (!fieldsData || fieldsData.length === 0)
    }, [documentType, formData.documentTemplate, reviewers, signers, documentClerks, isCopy, copyFromContractId]);

    // Load organization details and participants data when entering step 2
    useEffect(() => {
        const loadStep2Data = async () => {
            if (currentStep === 2) {
                // Load organization details if not already loaded
                if (organizationId && !formData.organization) {
                    try {
                        const orgResponse = await customerService.getOrganizationById(organizationId);
                        if (orgResponse.code === 'SUCCESS' && orgResponse.data) {
                            setFormData(prev => ({
                                ...prev,
                                organization: orgResponse.data.name || currentUser?.organizationName || ''
                            }));
                        }
                    } catch (err) {
                        console.error('Error loading organization details:', err);
                        // Fallback to user's organization name if available
                        if (currentUser?.organizationName) {
                            setFormData(prev => ({
                                ...prev,
                                organization: currentUser.organizationName
                            }));
                        }
                    }
                }

                // Load existing participants data if available (when returning to step 2)
                if (participantsData && participantsData.length > 0 && contractId) {
                    try {
                        // Parse participantsData to populate reviewers, signers, clerks
                        const participant = participantsData[0];
                        if (participant && participant.recipients) {
                            const newReviewers = [];
                            const newSigners = [];
                            const newClerks = [];

                            participant.recipients.forEach((recipient, index) => {
                                const recipientData = {
                                    id: Date.now() + index, // Generate new ID for UI
                                    recipientId: recipient.id, // Keep original ID for API
                                    fullName: recipient.name || '',
                                    email: recipient.email || '',
                                    phone: recipient.phone || '',
                                    card_id: recipient.card_id || recipient.cardId || '',
                                    ordering: recipient.ordering || index + 1,
                                    loginByPhone: recipient.loginByPhone || false
                                };

                                if (recipient.role === 2) { // Xem xét
                                    newReviewers.push(recipientData);
                                } else if (recipient.role === 3) { // Ký
                                    newSigners.push(recipientData);
                                } else if (recipient.role === 4) { // Văn thư
                                    newClerks.push(recipientData);
                                }
                            });

                            // Only update if we have data and haven't loaded yet
                            // Check if signers only have empty default entry
                            const hasOnlyEmptySigner = signers.length === 1 &&
                                !signers[0].fullName && !signers[0].email;
                            const shouldLoad = (newReviewers.length > 0 || newSigners.length > 0 || newClerks.length > 0) &&
                                (reviewers.length === 0 && hasOnlyEmptySigner && documentClerks.length === 0);

                            if (shouldLoad) {
                                setReviewers(newReviewers);
                                if (newSigners.length > 0) {
                                    setSigners(newSigners);
                                } else {
                                    // Keep the default empty signer if no signers from API
                                    // (This should not happen as at least one signer is required)
                                }
                                setDocumentClerks(newClerks);
                            }

                            // Update organization ordering if available
                            if (participant.ordering) {
                                setFormData(prev => ({
                                    ...prev,
                                    organizationOrdering: participant.ordering
                                }));
                            }
                        }
                    } catch (err) {
                        console.error('Error loading participants data:', err);
                    }
                }
            }
        };

        loadStep2Data();
    }, [currentStep, organizationId, currentUser, contractId]);

    // Clean up invalid recipientId trong fieldsData khi participantsData được load
    // (Khi tạo hợp đồng từ template, recipientId từ template không tồn tại trong hợp đồng mới)
    useEffect(() => {
        if (participantsData && participantsData.length > 0 && fieldsData && fieldsData.length > 0) {
            // Lấy danh sách tất cả recipientId hợp lệ
            const validRecipientIds = new Set();
            participantsData.forEach(participant => {
                if (participant.recipients && participant.recipients.length > 0) {
                    participant.recipients.forEach(recipient => {
                        if (recipient.id) {
                            validRecipientIds.add(recipient.id);
                        }
                    });
                }
            });

            // Kiểm tra và reset recipientId không hợp lệ
            const hasInvalidRecipientId = fieldsData.some(field => 
                field.recipientId && !validRecipientIds.has(field.recipientId)
            );

            if (hasInvalidRecipientId) {
                const cleanedFields = fieldsData.map(field => ({
                    ...field,
                    // Reset recipientId nếu không tồn tại trong participantsData
                    recipientId: field.recipientId && validRecipientIds.has(field.recipientId) 
                        ? field.recipientId 
                        : null
                }));
                setFieldsData(cleanedFields);
            }
        }
    }, [participantsData]);

    // Điều chỉnh số bước dựa trên loại tài liệu
    const getSteps = () => {
        return [
            { id: 1, title: 'THÔNG TIN TÀI LIỆU', active: currentStep === 1 },
            { id: 2, title: 'XÁC ĐỊNH NGƯỜI KÝ', active: currentStep === 2 },
            { id: 3, title: 'THIẾT KẾ TÀI LIỆU', active: currentStep === 3 },
            { id: 4, title: 'XÁC NHẬN VÀ HOÀN TẤT', active: currentStep === 4 }
        ];
    };

    const steps = getSteps();
    const maxStep = 4;

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

        // Nếu không nhập số tài liệu thì đánh dấu invalid (vì bắt buộc)
        if (!documentNumber) {
            setIsDocumentNumberValid(false);
            return;
        }

        try {
            setIsCheckingDocumentNumber(true);
            const response = await contractService.checkCodeUnique(documentNumber);

            if (response.code === 'SUCCESS') {
                let isUnique = false;

                // Xử lý 2 format response có thể có:
                // Format 1: data là boolean (theo API_DOCUMENTATION.md)
                //   - true: unique (có thể dùng)
                //   - false: đã tồn tại
                if (typeof response.data === 'boolean') {
                    isUnique = response.data === true;
                }
                // Format 2: data là object với isExist (theo CreateContractFlow.md)
                //   - isExist: "false" → unique (chưa tồn tại) → OK
                //   - isExist: "true" → đã tồn tại → ERROR
                else if (response.data && typeof response.data === 'object') {
                    const isExist = response.data.isExist;
                    // isExist có thể là string "true"/"false" hoặc boolean
                    if (typeof isExist === 'string') {
                        isUnique = isExist.toLowerCase() === 'false';
                    } else {
                        isUnique = !isExist; // Nếu boolean thì !isExist
                    }
                }

                setIsDocumentNumberValid(isUnique);

                if (!isUnique) {
                    showToast('Mã hợp đồng đã tồn tại. Vui lòng nhập mã khác.', 'error');
                }
            } else {
                // Response không thành công
                showToast(response.message || 'Không thể kiểm tra mã hợp đồng', 'error');
                setIsDocumentNumberValid(false);
            }
        } catch (err) {
            console.error('Error checking document number:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi kiểm tra mã hợp đồng';
            showToast(errorMsg, 'error');
            // Nếu lỗi API thì set invalid để user không thể submit
            setIsDocumentNumberValid(false);
        } finally {
            setIsCheckingDocumentNumber(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Chỉ hỗ trợ file PDF', 'error');
            return;
        }

        try {
            setLoading(true);
            console.log('[handleFileUpload] Starting file upload process...');
            console.log('[handleFileUpload] File selected:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // 1. Gọi API kiểm tra số trang
            console.log('[handleFileUpload] Calling getPageSize API...');
            const pageSizeResponse = await contractService.getPageSize(file);

            console.log('[handleFileUpload] getPageSize response:', {
                code: pageSizeResponse?.code,
                message: pageSizeResponse?.message,
                data: pageSizeResponse?.data
            });

            if (pageSizeResponse.code !== 'SUCCESS') {
                console.error('[handleFileUpload] getPageSize failed:', pageSizeResponse);
                throw new Error(pageSizeResponse.message || 'Không thể kiểm tra số trang của file');
            }

            const pageCount = pageSizeResponse.data?.numberOfPages || 0;
            console.log('[handleFileUpload] Page count received:', pageCount);

            // 2. Gọi API kiểm tra chữ ký số
            console.log('[handleFileUpload] Calling checkSignature API...');
            const signatureResponse = await contractService.checkSignature(file);

            console.log('[handleFileUpload] checkSignature response:', {
                code: signatureResponse?.code,
                message: signatureResponse?.message,
                data: signatureResponse?.data
            });

            if (signatureResponse.code !== 'SUCCESS') {
                console.error('[handleFileUpload] checkSignature failed:', signatureResponse);
                throw new Error(signatureResponse.message || 'Không thể kiểm tra chữ ký số');
            }

            const hasSignature = signatureResponse.data?.hasSignature || false;
            console.log('[handleFileUpload] Signature check result:', hasSignature);

            // 3. Validate: Nếu có chữ ký số thì báo lỗi
            if (hasSignature) {
                console.warn('[handleFileUpload] File has signature, rejecting upload');
                showToast('Tài liệu đã có chữ ký số, vui lòng chọn file khác', 'error');
                e.target.value = ''; // Reset input
                return;
            }

            // 4. Cập nhật formData
            console.log('[handleFileUpload] File validation passed, updating formData');
            setFormData(prev => ({
                ...prev,
                pdfFile: file,
                pdfFileName: file.name,
                pdfPageCount: parseInt(pageCount),
                hasSignature: hasSignature,
                attachedFile: file.name
            }));

            console.log('[handleFileUpload] File uploaded successfully:', {
                fileName: file.name,
                pageCount: parseInt(pageCount),
                hasSignature: hasSignature
            });

        } catch (err) {
            console.error('[handleFileUpload] Error uploading file:', {
                error: err,
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            showToast(err.message || 'Đã xảy ra lỗi khi tải file. Vui lòng thử lại.', 'error');
            e.target.value = ''; // Reset input
        } finally {
            setLoading(false);
            console.log('[handleFileUpload] Upload process completed');
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
            phone: '',
            card_id: '',
            ordering: reviewers.length + 1
        };
        setReviewers([...reviewers, newReviewer]);
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
        setSigners([...signers, newSigner]);
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
        setDocumentClerks([...documentClerks, newClerk]);
    };

    const updateSigner = (id, field, value) => {
        setSigners(prevSigners =>
            prevSigners.map(signer =>
                signer.id === id ? { ...signer, [field]: value } : signer
            )
        );
    };

    const updateReviewer = (id, field, value) => {
        setReviewers(prevReviewers =>
            prevReviewers.map(reviewer =>
                reviewer.id === id ? { ...reviewer, [field]: value } : reviewer
            )
        );
    };

    const updateDocumentClerk = (id, field, value) => {
        setDocumentClerks(prevClerks =>
            prevClerks.map(clerk =>
                clerk.id === id ? { ...clerk, [field]: value } : clerk
            )
        );
    };

    const removeSigner = (id) => {
        if (signers.length > 1) {
            setSigners(signers.filter(signer => signer.id !== id));
        }
    };

    const removeReviewer = (id) => {
        setReviewers(reviewers.filter(reviewer => reviewer.id !== id));
    };

    const removeDocumentClerk = (id) => {
        setDocumentClerks(documentClerks.filter(clerk => clerk.id !== id));
    };

    // Partner management functions
    const addPartner = () => {
        const newPartner = {
            id: Date.now(),
            type: 2, // 2 = Đối tác (Organization), 3 = Cá nhân (Individual)
            name: '',
            ordering: partners.length + 2, // Start from 2 (1 is for "Tổ chức của tôi")
            coordinators: [],
            reviewers: [],
            signers: [],
            clerks: []
        };
        setPartners([...partners, newPartner]);
    };

    const removePartner = (id) => {
        setPartners(partners.filter(partner => partner.id !== id));
    };

    const updatePartner = (id, field, value) => {
        setPartners(prevPartners =>
            prevPartners.map(partner => {
                if (partner.id === id) {
                    // If changing type to individual (3), clear coordinators, reviewers, and clerks
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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

    // Partner signer functions
    const addPartnerSigner = (partnerId) => {
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
                if (partner.id === partnerId) {
                    return {
                        ...partner,
                        signers: partner.signers.filter(s => s.id !== signerId)
                    };
                }
                return partner;
            })
        );
    };

    // Partner clerk functions
    const addPartnerClerk = (partnerId) => {
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
        setPartners(prevPartners =>
            prevPartners.map(partner => {
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
            organizationOrdering: Number.isNaN(parsed) ? '' : Math.max(1, parsed)
        }));
    };

    const validateEmail = (email) => {
        if (!email) return false;
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email.trim());
    };

    const validatePhone = (phone) => {
        if (!phone) return false;
        // Vietnamese phone number format: 10-11 digits, may start with 0 or +84
        const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
        return phoneRegex.test(phone.trim().replace(/\s/g, ''));
    };

    const validateStep2 = () => {
        const errors = [];

        if (!contractId) {
            errors.push('Không tìm thấy thông tin hợp đồng. Vui lòng hoàn thành bước 1 trước.');
        }

        // Validate signers - check email or phone based on loginByPhone
        const validSigners = signers.filter((signer) => {
            const hasName = signer.fullName?.trim();
            if (!hasName) return false;

            if (signer.loginByPhone) {
                return validatePhone(signer.phone);
            } else {
                return validateEmail(signer.email);
            }
        });

        if (validSigners.length === 0) {
            errors.push('Vui lòng thêm ít nhất một người ký với tên và email/số điện thoại hợp lệ.');
        }

        // Check invalid signers
        const invalidSigners = signers.filter((signer) => {
            if (!signer.fullName?.trim()) return false;
            if (signer.loginByPhone) {
                return !validatePhone(signer.phone);
            } else {
                return !validateEmail(signer.email);
            }
        });
        if (invalidSigners.length > 0) {
            errors.push('Email hoặc số điện thoại của người ký không hợp lệ.');
        }

        // Validate cardId for signers (Mã số thuế/CMT/CCCD is required)
        const signersWithoutCardId = signers.filter((signer) => {
            const hasName = signer.fullName?.trim();
            if (!hasName) return false; // Skip empty signers
            const cardId = signer.cardId || signer.card_id || '';
            return !cardId.trim();
        });
        if (signersWithoutCardId.length > 0) {
            errors.push('Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký.');
        }

        const incompleteReviewers = reviewers.filter((reviewer) =>
            reviewer.fullName !== undefined &&
            reviewer.email !== undefined &&
            (!reviewer.fullName?.trim() || !reviewer.email?.trim())
        );
        if (incompleteReviewers.length > 0) {
            errors.push('Vui lòng nhập đầy đủ Họ tên và Email cho tất cả người xem xét.');
        }

        const invalidReviewers = reviewers.filter((reviewer) => reviewer.email && !validateEmail(reviewer.email));
        if (invalidReviewers.length > 0) {
            errors.push('Email của người xem xét không hợp lệ.');
        }

        const incompleteClerks = documentClerks.filter((clerk) =>
            clerk.fullName !== undefined &&
            clerk.email !== undefined &&
            (!clerk.fullName?.trim() || !clerk.email?.trim())
        );
        if (incompleteClerks.length > 0) {
            errors.push('Vui lòng nhập đầy đủ Họ tên và Email cho tất cả văn thư.');
        }

        const invalidClerks = documentClerks.filter((clerk) => clerk.email && !validateEmail(clerk.email));
        if (invalidClerks.length > 0) {
            errors.push('Email của văn thư không hợp lệ.');
        }

        // Validate partners
        partners.forEach((partner, index) => {
            if (!partner.name?.trim()) {
                errors.push(`Vui lòng nhập tên cho đối tác ${index + 1}.`);
                return;
            }

            // For organization type, validate all roles
            if (partner.type === 2) {
                // Validate that partner has at least one person (coordinator, reviewer, signer, or clerk)
                const totalPeople = 
                    partner.coordinators.filter(c => c.fullName?.trim() && c.email?.trim()).length +
                    partner.reviewers.filter(r => r.fullName?.trim() && r.email?.trim()).length +
                    partner.signers.filter(s => {
                        if (!s.fullName?.trim()) return false;
                        if (s.loginByPhone) {
                            return s.phone?.trim() && validatePhone(s.phone);
                        } else {
                            return s.email?.trim() && validateEmail(s.email);
                        }
                    }).length +
                    partner.clerks.filter(c => c.fullName?.trim() && c.email?.trim()).length;
                
                if (totalPeople === 0) {
                    errors.push(`Đối tác "${partner.name}" phải có ít nhất một người (điều phối, xem xét, ký, hoặc văn thư).`);
                }

                // Validate coordinators
                const incompleteCoordinators = partner.coordinators.filter((coord) =>
                    coord.fullName !== undefined &&
                    coord.email !== undefined &&
                    (!coord.fullName?.trim() || !coord.email?.trim())
                );
                if (incompleteCoordinators.length > 0) {
                    errors.push(`Vui lòng nhập đầy đủ Họ tên và Email cho người điều phối trong đối tác "${partner.name}".`);
                }

                const invalidCoordinators = partner.coordinators.filter((coord) =>
                    coord.email && !validateEmail(coord.email)
                );
                if (invalidCoordinators.length > 0) {
                    errors.push(`Email của người điều phối trong đối tác "${partner.name}" không hợp lệ.`);
                }

                // Validate reviewers
                const incompletePartnerReviewers = partner.reviewers.filter((reviewer) =>
                    reviewer.fullName !== undefined &&
                    reviewer.email !== undefined &&
                    (!reviewer.fullName?.trim() || !reviewer.email?.trim())
                );
                if (incompletePartnerReviewers.length > 0) {
                    errors.push(`Vui lòng nhập đầy đủ Họ tên và Email cho người xem xét trong đối tác "${partner.name}".`);
                }

                const invalidReviewers = partner.reviewers.filter((reviewer) =>
                    reviewer.email && !validateEmail(reviewer.email)
                );
                if (invalidReviewers.length > 0) {
                    errors.push(`Email của người xem xét trong đối tác "${partner.name}" không hợp lệ.`);
                }

                // Validate signers
                const invalidSigners = partner.signers.filter((signer) => {
                    if (!signer.fullName?.trim()) return false;
                    if (signer.loginByPhone) {
                        return !validatePhone(signer.phone);
                    } else {
                        return !validateEmail(signer.email);
                    }
                });
                if (invalidSigners.length > 0) {
                    errors.push(`Email hoặc số điện thoại của người ký trong đối tác "${partner.name}" không hợp lệ.`);
                }

                // Validate cardId for partner signers (Mã số thuế/CMT/CCCD is required)
                const partnerSignersWithoutCardId = partner.signers.filter((signer) => {
                    const hasName = signer.fullName?.trim();
                    if (!hasName) return false; // Skip empty signers
                    const cardId = signer.cardId || signer.card_id || '';
                    return !cardId.trim();
                });
                if (partnerSignersWithoutCardId.length > 0) {
                    errors.push(`Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký trong đối tác "${partner.name}".`);
                }

                // Validate clerks
                const incompletePartnerClerks = partner.clerks.filter((clerk) =>
                    clerk.fullName !== undefined &&
                    clerk.email !== undefined &&
                    (!clerk.fullName?.trim() || !clerk.email?.trim())
                );
                if (incompletePartnerClerks.length > 0) {
                    errors.push(`Vui lòng nhập đầy đủ Họ tên và Email cho văn thư trong đối tác "${partner.name}".`);
                }

                const invalidClerks = partner.clerks.filter((clerk) =>
                    clerk.email && !validateEmail(clerk.email)
                );
                if (invalidClerks.length > 0) {
                    errors.push(`Email của văn thư trong đối tác "${partner.name}" không hợp lệ.`);
                }
            }
            // For individual type, only validate signers
            else if (partner.type === 3) {
                const validSigners = partner.signers.filter((signer) => {
                    const hasName = signer.fullName?.trim();
                    if (!hasName) return false;

                    if (signer.loginByPhone) {
                        return validatePhone(signer.phone);
                    } else {
                        return validateEmail(signer.email);
                    }
                });

                if (validSigners.length === 0) {
                    errors.push(`Vui lòng thêm ít nhất một người ký cho đối tác "${partner.name}".`);
                }

                const invalidSigners = partner.signers.filter((signer) => {
                    if (!signer.fullName?.trim()) return false;
                    if (signer.loginByPhone) {
                        return !validatePhone(signer.phone);
                    } else {
                        return !validateEmail(signer.email);
                    }
                });
                if (invalidSigners.length > 0) {
                    errors.push(`Email hoặc số điện thoại của người ký trong đối tác "${partner.name}" không hợp lệ.`);
                }

                // Validate cardId for partner signers (Mã số thuế/CMT/CCCD is required)
                const partnerSignersWithoutCardId = partner.signers.filter((signer) => {
                    const hasName = signer.fullName?.trim();
                    if (!hasName) return false; // Skip empty signers
                    const cardId = signer.cardId || signer.card_id || '';
                    return !cardId.trim();
                });
                if (partnerSignersWithoutCardId.length > 0) {
                    errors.push(`Vui lòng nhập Mã số thuế/CMT/CCCD cho tất cả người ký trong đối tác "${partner.name}".`);
                }
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

        // Helper to add recipients with proper ordering per role
        const addRecipients = (items, role, recipientsArray) => {
            // Filter valid items first
            // For signers (role = 3), check phone if loginByPhone = true, otherwise check email
            const validItems = items.filter(item => {
                const fullName = item.fullName?.trim();
                if (!fullName) return false;

                // For signers, check phone or email based on loginByPhone
                if (role === 3 && item.loginByPhone) {
                    const phone = item.phone?.trim();
                    return phone && validatePhone(phone);
                } else {
                    const email = item.email?.trim();
                    return email && validateEmail(email);
                }
            });

            // For each valid item, calculate ordering based on role
            // If custom ordering is provided, use it; otherwise, use sequential ordering within the role
            validItems.forEach((item, index) => {
                const fullName = item.fullName?.trim();

                // Use custom ordering if provided and valid, otherwise use index + 1 for this role
                const customOrdering = parseInt(item.ordering, 10);
                const ordering = (Number.isNaN(customOrdering) || customOrdering <= 0)
                    ? index + 1  // Sequential ordering within the same role
                    : customOrdering;

                // For signers with loginByPhone = true, use phone; otherwise use email
                const email = (role === 3 && item.loginByPhone) ? '' : (item.email?.trim() || '');
                const phone = (role === 3 && item.loginByPhone) ? (item.phone?.trim() || '') : (item.phone?.trim() || '');

                // cardId chỉ có cho signers (role === 3), trim để loại bỏ khoảng trắng thừa
                const cardId = role === 3 ? ((item.cardId || item.card_id || '').trim()) : '';

                // signType luôn = 6 theo CreateContractFlow.md
                recipientsArray.push({
                    // Chỉ include id khi đang edit và recipient đã tồn tại trong hợp đồng này
                    // KHÔNG include id khi tạo mới (kể cả từ template) để tránh lỗi detached entity
                    ...(isEdit && item.recipientId && { id: item.recipientId }),
                    name: fullName,
                    email,
                    phone,
                    cardId,
                    role,
                    ordering,
                    status: 0,
                    signType: 6  // Always 6 according to CreateContractFlow.md
                });
            });
        };

        // Build "Tổ chức của tôi" participant
        const myOrgRecipients = [];
        addRecipients(reviewers, 2, myOrgRecipients);  // role = 2: Xem xét
        addRecipients(signers, 3, myOrgRecipients);    // role = 3: Ký
        addRecipients(documentClerks, 4, myOrgRecipients);  // role = 4: Văn thư

        if (myOrgRecipients.length > 0) {
            const participantName = formData.organization?.trim() || 'Tổ chức của tôi';
            const participantOrdering = parseInt(formData.organizationOrdering, 10);
            const orderingValue = Number.isNaN(participantOrdering) || participantOrdering <= 0 ? 1 : participantOrdering;

            const participantPayload = {
                // Chỉ truyền id khi đang edit hợp đồng (không phải tạo từ template)
                ...(isEdit && participantsData?.[0]?.id && { id: participantsData[0].id }),
                name: participantName,
                type: 1,  // Tổ chức của tôi
                ordering: orderingValue,
                status: 1,
                contractId,
                recipients: myOrgRecipients
            };
            participants.push(participantPayload);
        }

        // Build partners participants
        partners.forEach((partner) => {
            const partnerRecipients = [];

            // Only add recipients if partner has a name
            if (partner.name?.trim()) {
                // For organization (type = 2), include all roles
                if (partner.type === 2) {
                    addRecipients(partner.coordinators, 1, partnerRecipients);  // role = 1: Điều phối
                    addRecipients(partner.reviewers, 2, partnerRecipients);     // role = 2: Xem xét
                    addRecipients(partner.signers, 3, partnerRecipients);       // role = 3: Ký
                    addRecipients(partner.clerks, 4, partnerRecipients);        // role = 4: Văn thư
                }
                // For individual (type = 3), only include signers
                else if (partner.type === 3) {
                    addRecipients(partner.signers, 3, partnerRecipients);       // role = 3: Ký
                }

                // Only add participant if it has at least one recipient
                if (partnerRecipients.length > 0) {
                    const partnerOrdering = parseInt(partner.ordering, 10);
                    const orderingValue = Number.isNaN(partnerOrdering) || partnerOrdering <= 0
                        ? participants.length + 1
                        : partnerOrdering;

                    const partnerPayload = {
                        // Chỉ truyền id khi đang edit hợp đồng (không phải tạo từ template)
                        ...(isEdit && partner.participantId && { id: partner.participantId }),
                        name: partner.name.trim(),
                        type: partner.type,  // 2 = Đối tác, 3 = Cá nhân
                        ordering: orderingValue,
                        status: 1,
                        contractId,
                        recipients: partnerRecipients
                    };
                    participants.push(partnerPayload);
                }
            }
        });

        return participants;
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

        if (!formData.expirationDate) {
            errors.push('Ngày hết hiệu lực tài liệu là bắt buộc');
        }

        if (!formData.pdfFile) {
            if (!isEdit || (isEdit && !documentId)) {
                errors.push('Vui lòng tải lên file PDF');
            }
        }

        if (documentType === 'single-template') {
            const templateValue = formData.documentTemplate;
            const templateStr = templateValue ? String(templateValue).trim() : '';
            if (!templateStr) {
                errors.push('Vui lòng chọn mẫu tài liệu');
            }
        }

        // Kiểm tra số tài liệu bắt buộc
        if (!formData.documentNumber || !formData.documentNumber.trim()) {
            errors.push('Vui lòng nhập số tài liệu');
        }

        // Kiểm tra số tài liệu hợp lệ (đã check unique)
        if (formData.documentNumber && formData.documentNumber.trim() && !isDocumentNumberValid) {
            errors.push('Mã hợp đồng đã tồn tại. Vui lòng nhập mã khác.');
        }

        if (errors.length > 0) {
            // Show first error in toast
            showToast(errors[0], 'error');
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

                // API 7: Tạo/Cập nhật hợp đồng
                console.log(isEdit ? 'Updating contract...' : 'Creating contract...');
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

                let currentContractId = contractId;
                let currentDocumentId = documentId;

                if (isEdit && currentContractId) {
                    const updateRes = await contractService.updateContract(currentContractId, contractData);
                    if (updateRes.code !== 'SUCCESS') {
                        throw new Error(updateRes.message || 'Không thể cập nhật hợp đồng');
                    }
                } else {
                    const contractResponse = await contractService.createContract(contractData);

                    if (contractResponse.code !== 'SUCCESS' || !contractResponse.data?.id) {
                        throw new Error(contractResponse.message || 'Không thể tạo hợp đồng');
                    }

                    currentContractId = contractResponse.data.id;
                    setContractId(currentContractId);
                    console.log('Contract created with ID:', currentContractId);
                }

                // API 8: Upload file PDF lên MinIO khi có file mới hoặc khi tạo mới
                if (formData.pdfFile) {
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
                        contractId: currentContractId,
                        fileName: uploadedFileName,
                        path: uploadedPath,
                        status: 1 // Active
                    };

                    const documentResponse = await contractService.createDocument(documentData);

                    if (documentResponse.code !== 'SUCCESS' || !documentResponse.data?.id) {
                        throw new Error(documentResponse.message || 'Không thể lưu thông tin tài liệu');
                    }

                    currentDocumentId = documentResponse.data.id;
                    setDocumentId(currentDocumentId);
                    console.log('Document created with ID:', currentDocumentId);
                } else if (!currentDocumentId) {
                    throw new Error('Không tìm thấy tài liệu hợp đồng. Vui lòng tải file PDF.');
                }

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
                                    contractId: currentContractId,
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

                setContractId(currentContractId);
                showToast(
                    isEdit
                        ? 'Cập nhật hợp đồng thành công!'
                        : 'Tạo hợp đồng thành công! Contract ID: ' + currentContractId,
                    'success',
                    3000
                );

                // Move to next step
                setCurrentStep(currentStep + 1);

            } catch (err) {
                console.error('Error in step 1:', err);
                showToast(err.message || 'Không thể tạo hợp đồng. Vui lòng thử lại.', 'error');
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 2) {
            if (!validateStep2()) {
                return;
            }

            const participantsPayload = buildParticipantsPayload();

            if (!participantsPayload || participantsPayload.length === 0) {
                showToast('Vui lòng nhập thông tin người xử lý trước khi tiếp tục.', 'error');
                return;
            }

            try {
                setLoading(true);

                const participantResponse = await contractService.createParticipant(contractId, participantsPayload);

                if (participantResponse.code !== 'SUCCESS') {
                    throw new Error(participantResponse.message || 'Không thể lưu người xử lý');
                }

                setParticipantsData(participantResponse.data || []);
                showToast('Lưu thông tin người xử lý thành công.', 'success', 3000);

                if (currentStep < maxStep) {
                    setCurrentStep(currentStep + 1);
                }
            } catch (err) {
                console.error('Error saving participants:', err);
                // Ưu tiên lấy message từ response, sau đó mới đến err.message
                const errorMessage = err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    'Không thể lưu người xử lý. Vui lòng thử lại.';
                showToast(errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 3) {
            if (unassignedComponentCount > 0) {
                showToast(`Vui lòng gán người xử lý cho ${unassignedComponentCount} thành phần trước khi tiếp tục.`, 'error');
                return;
            }

            // Validate tất cả fields đã có recipientId hợp lệ (tồn tại trong participantsData)
            if (fieldsData && fieldsData.length > 0 && participantsData && participantsData.length > 0) {
                // Lấy danh sách tất cả recipientId hợp lệ từ participantsData
                const validRecipientIds = new Set();
                participantsData.forEach(participant => {
                    if (participant.recipients && participant.recipients.length > 0) {
                        participant.recipients.forEach(recipient => {
                            if (recipient.id) {
                                validRecipientIds.add(recipient.id);
                            }
                        });
                    }
                });

                // Kiểm tra fields có recipientId không hợp lệ
                const invalidFields = fieldsData.filter(field => {
                    // Nếu field có recipientId nhưng không tồn tại trong validRecipientIds
                    if (field.recipientId && !validRecipientIds.has(field.recipientId)) {
                        return true;
                    }
                    // Nếu field không có recipientId (null hoặc undefined)
                    if (!field.recipientId) {
                        return true;
                    }
                    return false;
                });

                if (invalidFields.length > 0) {
                    showToast(`Vui lòng gán người xử lý hợp lệ cho ${invalidFields.length} field(s) trước khi tiếp tục.`, 'error');
                    return;
                }
            } else if (fieldsData && fieldsData.length > 0) {
                // Nếu có fields nhưng chưa có participantsData, yêu cầu hoàn thành step 2 trước
                const fieldsWithoutRecipient = fieldsData.filter(field => !field.recipientId);
                if (fieldsWithoutRecipient.length > 0) {
                    showToast(`Vui lòng gán người xử lý cho ${fieldsWithoutRecipient.length} field(s) trước khi tiếp tục.`, 'error');
                    return;
                }
            }

            if (currentStep < maxStep) {
                setCurrentStep(currentStep + 1);
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

    const handleSaveDraft = async () => {
        try {
            setLoading(true);

            // 1. Đảm bảo đã có hợp đồng (contract) + tài liệu (document) ở bước 1
            let currentContractId = contractId;
            let currentDocumentId = documentId;

            const buildContractData = () => ({
                name: formData.documentName?.trim() || '',
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
            });

            // 1.1. Nếu chưa có contractId -> tạo mới (mặc định status = DRAFT trên backend)
            if (!currentContractId) {
                const contractData = buildContractData();

                const contractResponse = await contractService.createContract(contractData);
                if (contractResponse.code !== 'SUCCESS' || !contractResponse.data?.id) {
                    throw new Error(contractResponse.message || 'Không thể tạo hợp đồng nháp');
                }

                currentContractId = contractResponse.data.id;
                setContractId(currentContractId);
            } else {
                // 1.2. Nếu đã có contractId -> cập nhật thông tin cơ bản
                const contractData = buildContractData();
                try {
                    await contractService.updateContract(currentContractId, contractData);
                } catch (e) {
                    // Không chặn flow nháp nếu update lỗi, chỉ log
                    console.warn('Không thể cập nhật thông tin hợp đồng khi lưu nháp:', e);
                }
            }

            // 1.3. Đảm bảo đã có document gốc (type = 1)
            if (!currentDocumentId && formData.pdfFile) {
                const uploadResponse = await contractService.uploadDocument(formData.pdfFile);
                if (uploadResponse.code !== 'SUCCESS' || !uploadResponse.data) {
                    throw new Error(uploadResponse.message || 'Không thể upload file PDF khi lưu nháp');
                }

                const { path: uploadedPath, fileName: uploadedFileName } = uploadResponse.data;
                const documentData = {
                    name: formData.documentName?.trim() || uploadedFileName,
                    type: 1,
                    contractId: currentContractId,
                    fileName: uploadedFileName,
                    path: uploadedPath,
                    status: 1
                };

                const documentResponse = await contractService.createDocument(documentData);
                if (documentResponse.code !== 'SUCCESS' || !documentResponse.data?.id) {
                    throw new Error(documentResponse.message || 'Không thể lưu thông tin tài liệu khi lưu nháp');
                }

                currentDocumentId = documentResponse.data.id;
                setDocumentId(currentDocumentId);
            }

            // 1.4. Lưu file đính kèm (nếu có) – không bắt buộc
            if (formData.attachedFiles && formData.attachedFiles.length > 0) {
                for (const file of formData.attachedFiles) {
                    try {
                        const attachUploadResponse = await contractService.uploadDocument(file);
                        if (attachUploadResponse.code === 'SUCCESS' && attachUploadResponse.data) {
                            const attachDocData = {
                                name: file.name,
                                type: 3,
                                contractId: currentContractId,
                                fileName: attachUploadResponse.data.fileName,
                                path: attachUploadResponse.data.path,
                                status: 1
                            };

                            await contractService.createDocument(attachDocData);
                        }
                    } catch (err) {
                        console.warn('Lỗi upload file đính kèm khi lưu nháp:', file.name, err);
                    }
                }
            }

            // 2. Nếu đang ở bước >= 2 -> lưu người xử lý (participants)
            if (currentStep >= 2) {
                const participantsPayload = buildParticipantsPayload();
                if (participantsPayload && participantsPayload.length > 0) {
                    try {
                        const participantResponse = await contractService.createParticipant(
                            currentContractId,
                            participantsPayload
                        );
                        if (participantResponse.code === 'SUCCESS') {
                            setParticipantsData(participantResponse.data || []);
                        }
                    } catch (err) {
                        console.warn('Không thể lưu người xử lý khi lưu nháp:', err);
                    }
                }
            }

            // 3. Nếu đang ở bước >= 3 -> lưu fields
            if (currentStep >= 3 && fieldsData && fieldsData.length > 0 && currentContractId && currentDocumentId) {
                try {
                    const toCreate = [];
                    const toUpdate = [];

                    fieldsData.forEach(field => {
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
                            contractId: currentContractId,
                            documentId: field.documentId || currentDocumentId,
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
                        await contractService.createField(toCreate);
                    }

                    for (const item of toUpdate) {
                        try {
                            await contractService.updateField(item.id, item.payload);
                        } catch (err) {
                            console.warn('Không thể cập nhật field khi lưu nháp:', item.id, err);
                        }
                    }

                    // Sau khi lưu, load lại fields từ backend để đồng bộ id vào state,
                    // tránh bị tạo trùng khi bấm Lưu nháp nhiều lần trong cùng session.
                    try {
                        const fieldsRes = await contractService.getFieldsByContract(currentContractId);
                        if (fieldsRes.code === 'SUCCESS' && Array.isArray(fieldsRes.data)) {
                            const mapped = fieldsRes.data.map(f =>
                                normalizeFieldFromApi(f, currentDocumentId)
                            );
                            setFieldsData(mapped);
                        }
                    } catch (err) {
                        console.warn('Không thể đồng bộ lại fields sau khi lưu nháp:', err);
                    }
                } catch (err) {
                    console.warn('Không thể lưu fields khi lưu nháp:', err);
                }
            }

            showToast('✅ Lưu nháp thành công.', 'success', 4000);

            // Điều hướng về danh sách bản nháp
            navigate('/main/contract/create/draft');
        } catch (err) {
            console.error('Error when saving draft:', err);
            showToast(err.message || 'Không thể lưu nháp. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        // Bước 4: Xác Nhận và Hoàn Tất
        // 4.1. Tạo Fields
        // 4.2. Thay đổi trạng thái hợp đồng sang CREATED (status = 10)

        if (!contractId || !documentId) {
            showToast('Không tìm thấy thông tin hợp đồng. Vui lòng quay lại bước 1.', 'error');
            return;
        }

        if (!fieldsData || fieldsData.length === 0) {
            showToast('Vui lòng thiết kế ít nhất một field trên tài liệu ở bước 3.', 'error');
            return;
        }

        try {
            setLoading(true);

            // 4.1. Tạo/Cập nhật Fields
            if (!isEdit) {
                const fieldsPayload = fieldsData.map(field => ({
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
                }));

                console.log('[Step 4] Creating fields...', fieldsPayload);
                const fieldsResponse = await contractService.createField(fieldsPayload);

                if (fieldsResponse.code !== 'SUCCESS') {
                    throw new Error(fieldsResponse.message || 'Không thể tạo fields');
                }

                console.log('[Step 4] Fields created:', fieldsResponse.data);
            } else {
                const toCreate = [];
                const toUpdate = [];

                fieldsData.forEach(field => {
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
                    console.log('[Step 4] Creating new fields (edit mode)...', toCreate);
                    const createRes = await contractService.createField(toCreate);
                    if (createRes.code !== 'SUCCESS') {
                        throw new Error(createRes.message || 'Không thể tạo field mới');
                    }
                }

                for (const item of toUpdate) {
                    const updateRes = await contractService.updateField(item.id, item.payload);
                    if (updateRes.code !== 'SUCCESS') {
                        throw new Error(updateRes.message || 'Không thể cập nhật field');
                    }
                }
            }

            // 4.2. Thay đổi trạng thái hợp đồng sang CREATED (status = 10)
            console.log('[Step 4] Changing contract status to CREATED (10)...');
            const statusResponse = await contractService.changeContractStatus(contractId, 10);

            if (statusResponse.code !== 'SUCCESS') {
                throw new Error(statusResponse.message || 'Không thể cập nhật trạng thái hợp đồng');
            }

            console.log('[Step 4] Contract status updated:', statusResponse.data);

            showToast('✅ Tạo hợp đồng thành công! Hợp đồng đã được tạo với trạng thái "Đã tạo".', 'success', 5000);

            // Redirect đến màn hình hợp đồng đã tạo sau 1.5 giây để user có thể thấy toast
            setTimeout(() => {
                navigate('/main/contract/create/processing');
            }, 1500);

        } catch (err) {
            console.error('[Step 4] Error completing contract:', err);
            showToast(err.message || 'Không thể hoàn tất hợp đồng. Vui lòng thử lại.', 'error');
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
            <DocumentTypeSelection
                documentType={documentType}
                setDocumentType={setDocumentType}
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileUpload={handleFileUpload}
                documentTypes={documentTypes}
                relatedContracts={relatedContracts}
                documentTemplates={documentTemplates}
                loading={loading}
                handleDocumentNumberBlur={handleDocumentNumberBlur}
                isCheckingDocumentNumber={isCheckingDocumentNumber}
                isDocumentNumberValid={isDocumentNumberValid}
                handleAttachedFilesUpload={handleAttachedFilesUpload}
                removeAttachedFile={removeAttachedFile}
            />
        );
    };

    // Helper function for name autocomplete (Step 2)
    // Returns array of { name, email, phone } objects
    // textSearch có thể rỗng hoặc < 2 ký tự để lấy suggestions
    const suggestName = async (textSearch) => {
        try {
            // Gọi API ngay cả khi textSearch rỗng hoặc < 2 ký tự
            const searchText = textSearch?.trim() || '';
            const response = await customerService.suggestListCustomer(searchText);
            if (response.code === 'SUCCESS' && response.data) {
                // Return full objects with name, email, and phone (if available)
                return response.data.map(item => ({
                    name: item.name || '',
                    email: item.email || '',
                    phone: item.phone || ''
                })).filter(item => item.name);
            }
            return [];
        } catch (err) {
            console.error('Error fetching name suggestions:', err);
            return [];
        }
    };

    const renderStep2 = () => {
        return (
            <DocumentSigners
                documentType={documentType}
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
                documentType={documentType}
                contractId={contractId}
                documentId={documentId}
                participantsData={participantsData}
                fieldsData={fieldsData}
                onFieldsChange={setFieldsData}
                totalPages={formData.pdfPageCount || 1}
                templatePdfUrl={templateMeta?.templatePdfUrl}
                onBack={() => setCurrentStep(2)}
                onNext={() => setCurrentStep(4)}
                onSaveDraft={() => {
                    console.log('Lưu nháp từ DocumentForm');
                    // Logic lưu nháp
                }}
                hideFooter={true}
                onAssignmentStateChange={setUnassignedComponentCount}
            />
        );
    };

    const renderStep4 = () => {
        // Lấy danh sách người điều phối, người xem xét, người ký, văn thư chỉ từ tổ chức của user (type = 1)
        const coordinators = [];
        const myOrgReviewers = [];
        const myOrgSigners = [];
        const myOrgClerks = [];
        // Lấy danh sách đối tác từ participantsData (participants có type = 2 hoặc 3, không phải type = 1)
        const partnerParticipants = [];
        
        if (participantsData && participantsData.length > 0) {
            participantsData.forEach(participant => {
                // Chỉ lấy thông tin từ tổ chức của user (type = 1)
                if (participant.type === 1) {
                    if (participant.recipients && participant.recipients.length > 0) {
                        participant.recipients.forEach(recipient => {
                            const recipientData = {
                                id: recipient.id,
                                fullName: recipient.name || '',
                                email: recipient.email || '',
                                phone: recipient.phone || '',
                                ordering: recipient.ordering || 1
                            };
                            
                            if (recipient.role === 1) {
                                coordinators.push(recipientData);
                            } else if (recipient.role === 2) {
                                myOrgReviewers.push(recipientData);
                            } else if (recipient.role === 3) {
                                myOrgSigners.push(recipientData);
                            } else if (recipient.role === 4) {
                                myOrgClerks.push(recipientData);
                            }
                        });
                    }
                }
                
                // Lấy đối tác (type = 2 hoặc 3, không phải type = 1 - tổ chức của tôi)
                if (participant.type === 2 || participant.type === 3) {
                    const partnerData = {
                        id: participant.id,
                        name: participant.name || '',
                        type: participant.type,
                        ordering: participant.ordering || 1,
                        coordinators: [],
                        reviewers: [],
                        signers: [],
                        clerks: []
                    };
                    
                    // Phân loại recipients theo role
                    if (participant.recipients && participant.recipients.length > 0) {
                        participant.recipients.forEach(recipient => {
                            const recipientData = {
                                id: recipient.id,
                                fullName: recipient.name || '',
                                email: recipient.email || '',
                                phone: recipient.phone || '',
                                ordering: recipient.ordering || 1
                            };
                            
                            if (recipient.role === 1) {
                                partnerData.coordinators.push(recipientData);
                            } else if (recipient.role === 2) {
                                partnerData.reviewers.push(recipientData);
                            } else if (recipient.role === 3) {
                                partnerData.signers.push(recipientData);
                            } else if (recipient.role === 4) {
                                partnerData.clerks.push(recipientData);
                            }
                        });
                    }
                    
                    partnerParticipants.push(partnerData);
                }
            });
        }

        return (
            <DocumentConfirmation
                documentType={documentType}
                formData={formData}
                setFormData={setFormData}
                reviewers={myOrgReviewers}
                signers={myOrgSigners}
                documentClerks={myOrgClerks}
                coordinators={coordinators}
                partnerParticipants={partnerParticipants}
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
        <>
            {!!toasts.length && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
                                borderRadius: 8,
                                color: t.variant === 'success' ? '#0a3622' : t.variant === 'warning' ? '#664d03' : '#842029',
                                background: t.variant === 'success' ? '#d1e7dd' : t.variant === 'warning' ? '#fff3cd' : '#f8d7da',
                                border: `1px solid ${t.variant === 'success' ? '#a3cfbb' : t.variant === 'warning' ? '#ffecb5' : '#f5c2c7'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
                                    <div key={step.id} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                        <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                            {step.id}
                                        </div>
                                        <div className="step-title">{step.title}</div>
                                    </div>
                                );
                            })}
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
        </>
    );
};

export default DocumentForm;
