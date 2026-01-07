import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import '../../styles/documentDetail.css';
import PDFViewer from '../document/PDFViewer';
import CoordinateAssigners from './CoordinateAssigners';
import RejectReviewDialog from './RejectReviewDialog';
import SignDialog from './SignDialog';
import AuthorizeDialog from './AuthorizeDialog';
import ViewFlowModal from '../document/ViewFlowModal';
import contractService from '../../api/contractService';

function ContractDetail() {
    const { type, contractId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [showSigningInfo, setShowSigningInfo] = useState(false); // dùng như state bật/tắt dialog luồng ký
    
    // State cho contract data
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho CoordinateAssigners
    const [showCoordinate, setShowCoordinate] = useState(false);
    const [coordinateStep, setCoordinateStep] = useState(1);
    const [participantId, setParticipantId] = useState(null);
    const [recipientId, setRecipientId] = useState(null);
    const [coordinatorRecipient, setCoordinatorRecipient] = useState(null);
    
    // State cho reviewers, signers, clerks
    const [reviewers, setReviewers] = useState([]);
    const [signers, setSigners] = useState([]);
    const [clerks, setClerks] = useState([]);
    const [partner, setPartner] = useState('');

    // State cho fields và highlight
    const [fields, setFields] = useState([]);
    const [highlightedFields, setHighlightedFields] = useState([]);
    const [highlightType, setHighlightType] = useState(null); // 'sign' | 'info' | null | 'auto'
    const [reviewDecision, setReviewDecision] = useState(''); // 'agree' | 'disagree' | ''
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showSignDialog, setShowSignDialog] = useState(false);
    const [showAuthorizeDialog, setShowAuthorizeDialog] = useState(false);
    const [textFieldValues, setTextFieldValues] = useState({});
    const [documentMeta, setDocumentMeta] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const [currentSignFieldIndex, setCurrentSignFieldIndex] = useState(0);
    const [focusComponentId, setFocusComponentId] = useState(null);
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

    const ToastStack = () => (
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
        </>
    );

    // Load contract data
    useEffect(() => {
        const loadContractData = async () => {
            if (!contractId) return;
            
            try {
                setLoading(true);
                setError(null);
                
                // Reset highlighted fields khi load lại
                const showAllFields = searchParams.get('showAllFields');
                if (showAllFields === '0' || showAllFields === 'false') {
                    setHighlightedFields([]);
                    setHighlightType(null);
                    setReviewDecision(''); // Reset review decision
                }
                
                // Lấy thông tin hợp đồng
                const contractResponse = await contractService.getContractById(contractId);
                if (contractResponse?.code === 'SUCCESS') {
                    const contractData = contractResponse.data;
                    setContract(contractData);
                    
                    // Lấy recipientId từ URL params hoặc từ contract data
                    const urlRecipientId = searchParams.get('recipientId');
                    if (urlRecipientId) {
                        setRecipientId(parseInt(urlRecipientId));
                        
                        // Lấy thông tin participant theo recipient ID
                        const participantResponse = await contractService.getParticipantByRecipientId(urlRecipientId);
                        if (participantResponse?.code === 'SUCCESS') {
                            const participantData = participantResponse.data;
                            setParticipantId(participantData.id);
                            
                            // Lấy người điều phối từ recipients
                            const coordinator = participantData.recipients?.find(r => r.role === 1);
                            if (coordinator) {
                                setCoordinatorRecipient(coordinator);
                            }
                        }
                    }
                    
                    // Lấy thông tin document để hiển thị PDF
                    const documentsResponse = await contractService.getDocumentsByContract(contractId);
                    if (documentsResponse?.code === 'SUCCESS' && documentsResponse.data?.length > 0) {
                        const documents = documentsResponse.data;

                        // Dùng trạng thái từ contractData (vừa fetch) để chọn file đúng
                        // Nếu hợp đồng bị từ chối (status = 31) ưu tiên type = 9 (annotated reject)
                        // Fallback: type = 2 (đã ký) -> type = 1 (gốc) -> phần tử đầu
                        const document =
                            (contractData?.status === 31 && documents.find(doc => doc.type === 9)) ||
                            documents.find(doc => doc.type === 2) ||
                            documents.find(doc => doc.type === 1) ||
                            documents[0];
                        
                        // Lấy presigned URL cho document
                        const urlResponse = await contractService.getPresignedUrl(document.id);
                        if (urlResponse?.code === 'SUCCESS') {
                            const presignedUrl = urlResponse?.data?.message || urlResponse?.data;
                            setDocumentMeta({
                                id: document.id,
                                name: document.name,
                                presignedUrl,
                                totalPages: document.page || 1
                            });
                            setTotalPages(document.page || 1);
                        }
                    }

                    // Lấy thông tin fields của hợp đồng
                    const fieldsResponse = await contractService.getFieldsByContract(contractId);
                    if (fieldsResponse?.code === 'SUCCESS') {
                        const fieldsData = fieldsResponse.data || [];
                        setFields(fieldsData);

                        // Khởi tạo text field values từ fields data
                        const initialTextValues = {};
                        fieldsData
                            .filter(f => (f.type === 1 || f.type === 4) && f.recipientId === parseInt(urlRecipientId))
                            .forEach(field => {
                                initialTextValues[field.id] = field.value || '';
                            });
                        setTextFieldValues(initialTextValues);

                        // Nếu từ danh sách "Tài liệu đã tạo" (showAllFields=1) thì tự hiển thị tất cả field lên PDF
                        const showAllFields = searchParams.get('showAllFields');
                        if (showAllFields === '1' || showAllFields === 'true') {
                            setHighlightedFields(fieldsData);
                            setHighlightType('auto');
                        } else if (showAllFields === '0' || showAllFields === 'false') {
                            // Ẩn tất cả fields khi showAllFields=0
                            setHighlightedFields([]);
                            setHighlightType(null);
                        }
                    }

                    // Lấy thông tin recipient nếu có recipientId
                    if (urlRecipientId) {
                        const recipientResponse = await contractService.getRecipientById(urlRecipientId);
                        if (recipientResponse?.code === 'SUCCESS') {
                            setRecipient(recipientResponse.data);
                        }
                    }
                } else {
                    throw new Error(contractResponse?.message || 'Không thể tải thông tin hợp đồng');
                }
            } catch (err) {
                console.error('Error loading contract:', err);
                setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadContractData();
    }, [contractId, searchParams]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Handler cho các nút action
    const handleDelegate = () => {
        if (!recipientId) {
            showToast('Không tìm thấy thông tin người xử lý', 'warning');
            return;
        }

        // Kiểm tra role của recipient
        if (!recipient) {
            showToast('Đang tải thông tin người xử lý...', 'warning');
            return;
        }

        const recipientRole = recipient.role;
        
        // Chỉ cho phép ủy quyền nếu là coordinator (role = 1) hoặc signer (role = 3)
        if (recipientRole !== 1 && recipientRole !== 3) {
            showToast('Chỉ người điều phối và người ký mới có thể ủy quyền', 'warning');
            return;
        }

        setShowAuthorizeDialog(true);
    };

    const handleAuthorizeSuccess = (data) => {
        console.log('Ủy quyền thành công:', data);
        showToast('Ủy quyền thành công!', 'success');
        // Navigate về màn detail sau khi ủy quyền thành công
        setTimeout(() => {
            navigate(`/main/c/detail/${contractId}`);
        }, 1200);
    };

    const handleReject = () => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối hợp đồng này?')) {
            console.log('Từ chối hợp đồng');
            // TODO: Implement reject logic
        }
    };

    const handleFindSignFields = () => {
        if (!recipientId) {
            showToast('Không tìm thấy thông tin người ký hiện tại.', 'warning');
            return;
        }

        const signFields = fields.filter(field =>
            (field.type === 2 || field.type === 3) &&
            Number(field.recipientId) === Number(recipientId)
        );

        if (!signFields.length) {
            showToast('Không tìm thấy ô ký dành cho bạn.', 'warning');
            return;
        }

        const targetIndex = currentSignFieldIndex % signFields.length;
        const targetField = signFields[targetIndex];

        setHighlightedFields(signFields);
        setHighlightType('sign');
        setFocusComponentId(`highlight-${targetField.id}`);

        if (targetField.page) {
            setCurrentPage(targetField.page);
        }

        setCurrentSignFieldIndex((targetIndex + 1) % signFields.length);
    };

    const handleFindInfoFields = () => {
        console.log('Tìm ô thông tin');
        // Filter fields có type là TEXT (1), CONTRACT_NO (4), MONEY (5)
        const infoFields = fields.filter(field => field.type === 1 || field.type === 4 || field.type === 5);
        
        if (!infoFields || infoFields.length === 0) {
            showToast('Không tìm thấy ô thông tin nào.', 'warning');
            return;
        }
        
        setHighlightedFields(infoFields);
        setHighlightType('info');
        
        // Chuyển đến trang đầu tiên có field thông tin
        if (infoFields.length > 0 && infoFields[0].page) {
            setCurrentPage(infoFields[0].page);
        }
        
        // Focus vào field đầu tiên
        if (infoFields[0]) {
            setFocusComponentId(`highlight-${infoFields[0].id}`);
        }
        
        console.log('Found info fields:', infoFields);
    };

    useEffect(() => {
        setCurrentSignFieldIndex(0);
    }, [fields, recipientId]);

    useEffect(() => {
        if (reviewDecision === 'disagree') {
            setFocusComponentId(null);
        }
    }, [reviewDecision]);

    // Convert highlighted fields to components for PDFViewer
    const getHighlightComponents = () => {
        if (reviewDecision === 'disagree') return [];
        if (!highlightedFields.length) return [];

        return highlightedFields.map(field => {
            // Xác định type của component
            let componentType;
            if (highlightType === 'sign') {
                // Khi ở chế độ sign, phân loại theo type của field
                componentType = (field.type === 1 || field.type === 4) ? 'text' : 'signature';
            } else if (highlightType === 'info') {
                componentType = 'text';
            } else {
                // Auto mode
                componentType = (field.type === 2 || field.type === 3) ? 'signature' : 'text';
            }

            // Text fields (type 1, 4) không bị locked để có thể click
            const isTextFieldClickable = type === 'sign' && (field.type === 1 || field.type === 4) && field.recipientId === recipientId;

            return {
                id: `highlight-${field.id}`,
                type: componentType,
                page: field.page || 1,
                properties: {
                    x: field.boxX || 0,
                    y: field.boxY || 0,
                    width: field.boxW || 100,
                    height: field.boxH || 30,
                    // Chỉ hiển thị value từ state hoặc từ API, không hiển thị field.name
                    fieldName: textFieldValues[field.id] || field.value || '',
                    // Lưu field name để hiển thị label
                    label: field.name || (field.type === 4 ? 'Số hợp đồng' : 'Nội dung')
                },
                name: field.name || '',
                recipient: field.recipient || null,
                highlight: true,
                highlightType: highlightType,
                locked: !isTextFieldClickable // Text field có thể click, signature field bị locked
            };
        });
    };

    const handleReviewClick = () => {
        if (!recipientId) {
            showToast('Không tìm thấy thông tin người xem xét', 'warning');
            return;
        }

        if (!reviewDecision) {
            showToast('Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận', 'warning');
            return;
        }

        if (reviewDecision === 'agree') {
            setShowReviewDialog(true);
        } else {
            // Open reject dialog with document metadata
            if (!documentMeta) {
                showToast('Không tìm thấy thông tin tài liệu', 'error');
                return;
            }
            setShowRejectDialog(true);
        }
    };

    const handleReviewConfirm = async () => {
        try {
            setLoading(true);
            const response = await contractService.approvalProcess(recipientId);

            if (response?.code === 'SUCCESS') {
                showToast('Đã xác nhận đồng ý với hợp đồng thành công!', 'success');
                setReviewDecision('');
                setShowReviewDialog(false);
                setTimeout(() => {
                    navigate(`/main/c/detail/${contractId}`);
                }, 1200);
            } else {
                throw new Error(response?.message || 'Xác nhận xem xét thất bại');
            }
        } catch (error) {
            console.error('Error reviewing contract:', error);
            showToast(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác nhận xem xét', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewCancel = () => {
        setShowReviewDialog(false);
        setShowRejectDialog(false);
    };

    const handleRejectSuccess = () => {
        console.log('Contract rejected successfully');
        setReviewDecision('');
        // Navigate đến trang chi tiết hợp đồng sau khi từ chối
        setTimeout(() => {
            navigate(`/main/c/detail/${contractId}`);
        }, 500);
    };

    const handleSignClick = () => {
        if (!recipientId) {
            showToast('Không tìm thấy thông tin người ký', 'warning');
            return;
        }

        // Kiểm tra recipient có quyền ký không (signType = 6)
        if (recipient && recipient.signType !== 6) {
            showToast('Người này không có quyền ký số. Vui lòng kiểm tra lại.', 'warning');
            return;
        }

        // Kiểm tra xem có text field nào chưa điền không
        const requiredTextFields = fields.filter(field => 
            (field.type === 1 || field.type === 4) && 
            field.recipientId === recipientId
        );

        const unfilledFields = requiredTextFields.filter(field => {
            const value = textFieldValues[field.id] || '';
            // Contract number field (type 4) là bắt buộc
            if (field.type === 4 && !value.trim()) {
                return true;
            }
            // Text field (type 1) cũng nên được điền
            if (field.type === 1 && !value.trim()) {
                return true;
            }
            return false;
        });

        if (unfilledFields.length > 0) {
            const fieldNames = unfilledFields.map(f => f.name || (f.type === 4 ? 'Số hợp đồng' : 'Nội dung')).join(', ');
            showToast(`Vui lòng điền đầy đủ thông tin cho các ô: ${fieldNames}`, 'warning', 5000);
            
            // Focus vào field đầu tiên chưa điền
            if (unfilledFields[0]) {
                setFocusComponentId(`highlight-${unfilledFields[0].id}`);
                if (unfilledFields[0].page) {
                    setCurrentPage(unfilledFields[0].page);
                }
            }
            return;
        }

        setShowSignDialog(true);
    };

    const handleSignSuccess = async (signedData) => {
        console.log('Contract signed successfully:', signedData);
        // Hiển thị dialog/thông báo ký thành công và điều hướng đến trang chi tiết
        showToast('Ký hợp đồng thành công!', 'success');
        setShowSignDialog(false);
        setTimeout(() => {
            // Sau khi ký xong, quay về màn chi tiết; nếu muốn ẩn các ô field có thể dùng showAllFields=0
            navigate(`/main/c/detail/${contractId}?showAllFields=0`);
        }, 1200);
    };

    const handleComponentClick = (component) => {
        // Chỉ xử lý khi ở chế độ sign và component là text field
        if (type !== 'sign') return;
        
        // Tìm field tương ứng với component
        const fieldId = component.id.replace('highlight-', '');
        const field = fields.find(f => f.id === parseInt(fieldId));
        
        if (!field) return;
        
        // Chỉ cho phép edit text fields (type 1, 4) thuộc về recipient hiện tại
        if ((field.type === 1 || field.type === 4) && field.recipientId === recipientId) {
            // Bật chế độ editing cho component này
            setEditingComponentId(component.id);
        }
    };

    const handleTextFieldChange = (componentId, value) => {
        const fieldId = componentId.replace('highlight-', '');
        setTextFieldValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleTextFieldBlur = () => {
        // Tắt chế độ editing
        setEditingComponentId(null);
    };

    const [editingComponentId, setEditingComponentId] = useState(null);

    const handleCoordinate = async () => {
        // Load existing signers từ participant data trước khi mở CoordinateAssigners
        if (recipientId && contractId) {
            try {
                // Lấy thông tin participant của user hiện tại để xác định tổ chức
                const participantResponse = await contractService.getParticipantByRecipientId(recipientId);
                if (participantResponse?.code === 'SUCCESS') {
                    const userParticipant = participantResponse.data;
                    const userOrgName = userParticipant.name; // Tên tổ chức của user
                    
                    // Lấy tất cả participants của hợp đồng
                    const allParticipantsResponse = await contractService.getAllParticipantsByContract(contractId);
                    if (allParticipantsResponse?.code === 'SUCCESS') {
                        const participantsData = allParticipantsResponse.data || [];
                        
                        // Tìm tất cả participants có cùng tên tổ chức với user
                        const sameOrgParticipants = participantsData.filter(p => p.name === userOrgName);
                        
                        // Load tất cả signers (role = 3) từ các participants cùng tổ chức
                        const existingSigners = [];
                        sameOrgParticipants.forEach(participant => {
                            if (participant.recipients) {
                                participant.recipients
                                    .filter(r => r.role === 3) // Chỉ lấy signers
                                    .forEach((recipient, index) => {
                                        existingSigners.push({
                                            id: Date.now() + existingSigners.length + index, // Generate new ID for UI
                                            recipientId: recipient.id, // Keep original ID for API
                                            fullName: recipient.name || '',
                                            email: recipient.email || '',
                                            phone: recipient.phone || '',
                                            card_id: recipient.cardId || recipient.card_id || '',
                                            loginByPhone: recipient.loginByPhone || false,
                                            signType: recipient.signType === 6 ? 'hsm' : 'hsm',
                                            ordering: recipient.ordering || existingSigners.length + 1
                                        });
                                    });
                            }
                        });
                        
                        if (existingSigners.length > 0) {
                            setSigners(existingSigners);
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading existing signers:', err);
            }
        }
        setShowCoordinate(true);
        setCoordinateStep(1);
    };

    // Hàm format trạng thái thành text
    const getStatusLabel = (status) => {
        if (!status && status !== 0) return 'Chưa xác định';
        
        const statusMap = {
            0: 'Nháp',
            10: 'Đã tạo',
            20: 'Đang xử lý',
            30: 'Hoàn thành',
            40: 'Thanh lý',
            31: 'Từ chối',
            32: 'Hủy bỏ',
            1: 'Sắp hết hạn',
            2: 'Hết hạn',
            35: 'Scan',
        };
        
        // Nếu backend trả sẵn text thì dùng luôn
        if (typeof status === 'string' && isNaN(Number(status))) {
            return status;
        }
        
        return statusMap[Number(status)] || 'Chưa xác định';
    };

    // Label trạng thái hiển thị trên nút ở chế độ xem chi tiết (type = 'detail')
    const getStatusButtonLabel = () => {
        return getStatusLabel(contract?.status);
    };

    // Lấy class CSS dựa trên trạng thái
    const getStatusClass = () => {
        const status = contract?.status;
        if (status === undefined && status !== 0) return 'status-unknown';
        
        const statusClassMap = {
            0: 'status-draft',      // Nháp
            10: 'status-created',   // Đã tạo
            20: 'status-processing', // Đang xử lý
            30: 'status-completed', // Hoàn thành
            40: 'status-liquidated', // Thanh lý
            31: 'status-rejected',  // Từ chối
            32: 'status-cancelled', // Hủy bỏ
            1: 'status-about-expire', // Sắp hết hạn
            2: 'status-expired',    // Hết hạn
            35: 'status-scan',      // Scan
        };
        
        return statusClassMap[Number(status)] || 'status-unknown';
    };

    const handleBackFromCoordinate = () => {
        if (coordinateStep > 1) {
            setCoordinateStep(coordinateStep - 1);
        } else {
            setShowCoordinate(false);
        }
    };

    const handleNextCoordinate = () => {
        if (coordinateStep < 3) {
            setCoordinateStep(coordinateStep + 1);
        }
    };

    // Handlers cho CoordinateAssigners
    const addReviewer = () => {
        const newReviewer = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            ordering: reviewers.length + 1
        };
        setReviewers([...reviewers, newReviewer]);
    };

    const updateReviewer = (id, field, value) => {
        setReviewers(reviewers.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeReviewer = (id) => {
        setReviewers(reviewers.filter(r => r.id !== id));
    };

    const addSigner = () => {
        const newSigner = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            loginByPhone: false,
            signType: 'hsm',
            ordering: signers.length + 1
        };
        setSigners([...signers, newSigner]);
    };

    const updateSigner = (id, field, value) => {
        setSigners(signers.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSigner = (id) => {
        setSigners(signers.filter(s => s.id !== id));
    };

    const addClerk = () => {
        const newClerk = {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            signType: 'hsm',
            ordering: clerks.length + 1
        };
        setClerks([...clerks, newClerk]);
    };

    const updateClerk = (id, field, value) => {
        setClerks(clerks.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeClerk = (id) => {
        setClerks(clerks.filter(c => c.id !== id));
    };

    const handleCoordinateSuccess = (data) => {
        console.log('Điều phối thành công:', data);
        showToast('Điều phối thành công!', 'success');
        setShowCoordinate(false);
        // Điều phối xong navigate về màn detail
        setTimeout(() => {
            navigate(`/main/c/detail/${contractId}`);
        }, 800);
    };

    const handleCoordinateError = (error) => {
        console.error('Lỗi điều phối:', error);
    };

    const handleBack = () => {
        // Nếu đang ở màn detail sau khi ký xong (showAllFields=0), về dashboard
        const showAllFields = searchParams.get('showAllFields');
        if (type === 'detail' && showAllFields === '0') {
            navigate('/main/dashboard');
        } else if (type === 'sign' || type === 'review' || type === 'coordinate') {
            // Nếu đang ở màn xử lý, về trang đã xử lý
            navigate('/main/processed-documents');
        } else {
            // Các trường hợp khác, back về trang trước
            navigate(-1);
        }
    };

    const pdfDocument = useMemo(() => {
        if (documentMeta?.presignedUrl) {
            return { pdfUrl: documentMeta.presignedUrl };
        }
        if (contract?.pdfUrl) {
            return { pdfUrl: contract.pdfUrl };
        }
        return null;
    }, [documentMeta, contract]);

    if (loading) {
        return (
            <>
                <ToastStack />
                <div className="contract-loading-container">
                    <div className="contract-loading-content">
                        <div className="contract-loading-spinner"></div>
                        <p className="contract-loading-text">Đang tải dữ liệu...</p>
                        <p className="contract-loading-subtext">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <ToastStack />
                <div className="contract-error-container">
                    <div className="contract-error-content">
                        <div className="contract-error-icon">⚠</div>
                        <h2 className="contract-error-title">Không thể tải dữ liệu</h2>
                        <p className="contract-error-message">{error}</p>
                        <div className="contract-error-actions">
                            <button className="contract-error-btn contract-error-btn-primary" onClick={handleBack}>
                                Quay lại
                            </button>
                            <button 
                                className="contract-error-btn contract-error-btn-secondary" 
                                onClick={() => window.location.reload()}
                            >
                                Tải lại
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Nếu đang hiển thị CoordinateAssigners
    if (showCoordinate) {
        return (
            <>
                <ToastStack />
                <div className="document-detail-container">
                    <CoordinateAssigners
                        partner={partner}
                        onPartnerChange={setPartner}
                        reviewers={reviewers}
                        addReviewer={addReviewer}
                        updateReviewer={updateReviewer}
                        removeReviewer={removeReviewer}
                        signers={signers}
                        addSigner={addSigner}
                        updateSigner={updateSigner}
                        removeSigner={removeSigner}
                        clerks={clerks}
                        addClerk={addClerk}
                        updateClerk={updateClerk}
                        removeClerk={removeClerk}
                        onBack={handleBackFromCoordinate}
                        onNext={handleNextCoordinate}
                        currentStep={coordinateStep}
                        totalSteps={3}
                        contractId={contractId}
                        recipientId={recipientId}
                        participantId={participantId}
                        coordinatorRecipient={coordinatorRecipient}
                        onCoordinateSuccess={handleCoordinateSuccess}
                        onCoordinateError={handleCoordinateError}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <ToastStack />
            <div className="document-detail-container">
            {/* Sidebar bên trái */}
            <div className={`document-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <span className={`toggle-icon ${sidebarCollapsed ? 'collapsed' : ''}`}>‹</span>
                </button>

                {!sidebarCollapsed && (
                    <div className="sidebar-content-container">
                        <div className="document-info-section">
                            <h3 className="section-title">THÔNG TIN CHI TIẾT HỢP ĐỒNG</h3>
                            <div className="info-item">
                                <label>Tên hợp đồng:</label>
                                <span>{contract?.name || 'Chưa có tên'}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã hợp đồng:</label>
                                <span>{contract?.contractNo || contract?.id || 'Chưa có mã'}</span>
                            </div>
                            <div className="info-item">
                                <label>Trạng thái:</label>
                                <span>{getStatusLabel(contract?.status)}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian tạo:</label>
                                <span>{formatDate(contract?.createdAt) || 'Chưa có'}</span>
                            </div>
                            
                            <button 
                                className="signing-info-btn" 
                                onClick={() => setShowSigningInfo(true)}
                            >
                                Thông tin ký
                                <span className="arrow-icon">›</span>
                            </button>

                            {(type === 'review' || type === 'sign') && (
                                <div className="sign-confirmation-section">
                                    <h3 className="section-title">
                                        {type === 'review' ? 'XEM XÉT TÀI LIỆU' : 'KÝ TÀI LIỆU'}
                                    </h3>
                                    <div className="confirmation-content">
                                        <p className="confirmation-question">
                                            Bạn có đồng ý với nội dung, các điều khoản trong tài liệu và sử dụng phương thức điện tử để thực hiện giao dịch không?
                                        </p>
                                        <div className="radio-options">
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="reviewDecision"
                                                    value="agree"
                                                    checked={reviewDecision === 'agree'}
                                                    onChange={() => {
                                                        setReviewDecision('agree');
                                                        // Khi chọn Đồng ý, tự động hiển thị tất cả text fields và signature fields
                                                        if (type === 'sign') {
                                                            const signFields = fields.filter(field => 
                                                                ((field.type === 1 || field.type === 4 || field.type === 3) && 
                                                                field.recipientId === recipientId)
                                                            );
                                                            if (signFields.length > 0) {
                                                                setHighlightedFields(signFields);
                                                                setHighlightType('sign');
                                                                // Chuyển đến trang đầu tiên có field
                                                                if (signFields[0].page) {
                                                                    setCurrentPage(signFields[0].page);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                                <span className="radio-label">Đồng ý</span>
                                            </label>
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="reviewDecision"
                                                    value="disagree"
                                                    checked={reviewDecision === 'disagree'}
                                                    onChange={() => setReviewDecision('disagree')}
                                                />
                                                <span className="radio-label">Không đồng ý</span>
                                            </label>
                                        </div>
                                        <p className="confirmation-note">
                                            Vui lòng lựa chọn trước khi nhấn nút Xác nhận ở phần Luồng xử lý tài liệu.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Nội dung chính */}
            <div className="pdf-content-wrapper">
                {/* Thanh điều khiển PDF */}
                <div className="pdf-controls">
                    <div className="pagination-controls">
                        <button 
                            className="page-btn" 
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            ««
                        </button>
                        <button 
                            className="page-btn" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        <span className="page-info">{currentPage} / {totalPages}</span>
                        <button 
                            className="page-btn" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                        <button 
                            className="page-btn" 
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »»
                        </button>
                    </div>
                    
                    <div className="zoom-controls">
                        <select 
                            value={zoom} 
                            onChange={(e) => handleZoomChange(Number(e.target.value))}
                            className="zoom-select"
                        >
                            <option value={50}>50%</option>
                            <option value={75}>75%</option>
                            <option value={100}>100%</option>
                            <option value={125}>125%</option>
                            <option value={150}>150%</option>
                            <option value={200}>200%</option>
                        </select>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="pdf-viewer">
                    {pdfDocument ? (
                        <PDFViewer
                            document={pdfDocument}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            zoom={zoom}
                            onPageChange={handlePageChange}
                            components={getHighlightComponents()}
                            focusComponentId={focusComponentId}
                            onComponentClick={handleComponentClick}
                            editingComponentId={editingComponentId}
                            onTextFieldChange={handleTextFieldChange}
                            onTextFieldBlur={handleTextFieldBlur}
                        />
                    ) : (
                        <div className="pdf-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang chuẩn bị URL tài liệu...</p>
                        </div>
                    )}
                </div>

                {/* Nút hành động */}
                {type === 'detail' ? (
                    <div className="document-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className={`edit-btn status-display ${getStatusClass()}`} type="button" disabled>
                            Trạng thái: {getStatusButtonLabel()}
                        </button>
                        <button className="edit-btn" onClick={handleBack}>
                            Đóng
                        </button>
                    </div>
                ) : (
                    <div className="document-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="edit-btn" onClick={handleDelegate}>
                            Ủy quyền/Chuyển tiếp
                        </button>
                        <button className="edit-btn" onClick={handleFindSignFields}>
                            Tìm ô ký
                        </button>
                        <button className="edit-btn" onClick={handleFindInfoFields}>
                            Tìm ô thông tin
                        </button>
                        {type === 'review' ? (
                            <button className="approve-btn" onClick={handleReviewClick}>
                                Xác nhận
                            </button>
                        ) : type === 'sign' ? (
                            <button className="approve-btn" onClick={() => {
                                if (!recipientId) {
                                    showToast('Không tìm thấy thông tin người ký', 'warning');
                                    return;
                                }
                                if (!reviewDecision) {
                                    showToast('Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận', 'warning');
                                    return;
                                }
                                if (reviewDecision === 'agree') {
                                    handleSignClick();
                                } else {
                                    // Không đồng ý -> mở RejectDialog, dùng cùng luồng với xem xét
                                    if (!documentMeta) {
                                        showToast('Không tìm thấy thông tin tài liệu', 'error');
                                        return;
                                    }
                                    setShowRejectDialog(true);
                                }
                            }}>
                                Xác nhận
                            </button>
                        ) : (
                            <button className="finish-btn" onClick={handleCoordinate}>
                                Điều phối
                            </button>
                        )}
                        <button className="edit-btn" onClick={handleBack}>
                            Đóng
                        </button>
                    </div>
                )}
            </div>
            </div>
            
            {/* Review Confirmation Dialog */}
            {showReviewDialog && (
                <div className="review-dialog-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="review-dialog" style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        minWidth: '380px',
                        maxWidth: '480px'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
                            Xác nhận gửi kết quả xem xét
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: '#555', lineHeight: 1.5 }}>
                            Bạn chuẩn bị gửi kết quả "<strong>{reviewDecision === 'agree' ? 'Đồng ý' : 'Không đồng ý'}</strong>" cho tài liệu này.
                            Bạn có chắc chắn muốn tiếp tục?
                        </p>

                        <div className="review-actions" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                className="edit-btn"
                                onClick={handleReviewCancel}
                                disabled={loading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="approve-btn"
                                onClick={handleReviewConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Review Dialog */}
            <RejectReviewDialog
                open={showRejectDialog}
                onClose={handleReviewCancel}
                contractId={contractId}
                recipientId={recipientId}
                documentMeta={documentMeta}
                onRejected={handleRejectSuccess}
            />

            {/* Sign Dialog */}
            <SignDialog
                open={showSignDialog}
                onClose={() => setShowSignDialog(false)}
                contractId={contractId}
                recipientId={recipientId}
                recipient={recipient}
                fields={fields}
                textFieldValues={textFieldValues}
                onSigned={handleSignSuccess}
            />

            {/* Authorize Dialog */}
            <AuthorizeDialog
                open={showAuthorizeDialog}
                onClose={() => setShowAuthorizeDialog(false)}
                recipientId={recipientId}
                recipientRole={recipient?.role}
                contractId={contractId}
                onAuthorizeSuccess={handleAuthorizeSuccess}
            />

            {/* Signing Flow Dialog (Luồng ký) */}
            <ViewFlowModal
                show={showSigningInfo}
                onClose={() => setShowSigningInfo(false)}
                contractId={contractId}
            />
        </>
    );
}

export default ContractDetail;

