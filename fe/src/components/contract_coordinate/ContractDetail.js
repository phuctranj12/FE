import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import '../../styles/documentDetail.css';
import PDFViewer from '../document/PDFViewer';
import CoordinateAssigners from './CoordinateAssigners';
import RejectReviewDialog from './RejectReviewDialog';
import SignDialog from './SignDialog';
import contractService from '../../api/contractService';

function ContractDetail() {
    const { type, contractId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [showSigningInfo, setShowSigningInfo] = useState(false);
    
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
    const [highlightType, setHighlightType] = useState(null); // 'sign' | 'info' | null
    const [reviewDecision, setReviewDecision] = useState(''); // 'agree' | 'disagree' | ''
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showSignDialog, setShowSignDialog] = useState(false);
    const [documentMeta, setDocumentMeta] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const [currentSignFieldIndex, setCurrentSignFieldIndex] = useState(0);
    const [focusComponentId, setFocusComponentId] = useState(null);

    // Load contract data
    useEffect(() => {
        const loadContractData = async () => {
            if (!contractId) return;
            
            try {
                setLoading(true);
                setError(null);
                
                // Lấy thông tin hợp đồng
                const contractResponse = await contractService.getContractById(contractId);
                if (contractResponse?.code === 'SUCCESS') {
                    setContract(contractResponse.data);
                    
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
                        const document = documentsResponse.data[0];
                        
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
                        setFields(fieldsResponse.data || []);
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
        console.log('Ủy quyền/Chuyển tiếp');
        // TODO: Implement delegate logic - có thể mở modal chọn người nhận ủy quyền
        alert('Chức năng ủy quyền đang được phát triển');
    };

    const handleReject = () => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối hợp đồng này?')) {
            console.log('Từ chối hợp đồng');
            // TODO: Implement reject logic
        }
    };

    const handleFindSignFields = () => {
        if (!recipientId) {
            alert('Không tìm thấy thông tin người ký hiện tại.');
            return;
        }

        const signFields = fields.filter(field =>
            (field.type === 2 || field.type === 3) &&
            Number(field.recipientId) === Number(recipientId)
        );

        if (!signFields.length) {
            alert('Không tìm thấy ô ký dành cho bạn.');
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
        setHighlightedFields(infoFields);
        setHighlightType('info');
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

        return highlightedFields.map(field => ({
            id: `highlight-${field.id}`,
            type: highlightType === 'sign' ? 'signature' : 'text',
            page: field.page || 1,
            properties: {
                x: field.boxX || 0,
                y: field.boxY || 0,
                width: field.boxW || 100,
                height: field.boxH || 30
            },
            name: field.name || '',
            recipient: field.recipient || null,
            highlight: true,
            highlightType: highlightType,
            locked: true // Không cho phép edit highlight fields
        }));
    };

    const handleReviewClick = () => {
        if (!recipientId) {
            alert('Không tìm thấy thông tin người xem xét');
            return;
        }

        if (!reviewDecision) {
            alert('Vui lòng chọn Đồng ý hoặc Không đồng ý trước khi xác nhận');
            return;
        }

        if (reviewDecision === 'agree') {
            setShowReviewDialog(true);
        } else {
            // Open reject dialog with document metadata
            if (!documentMeta) {
                alert('Không tìm thấy thông tin tài liệu');
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
                alert('Đã xác nhận đồng ý với hợp đồng thành công!');
                setReviewDecision('');
                setShowReviewDialog(false);
                navigate('/main/dashboard');
            } else {
                throw new Error(response?.message || 'Xác nhận xem xét thất bại');
            }
        } catch (error) {
            console.error('Error reviewing contract:', error);
            alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác nhận xem xét');
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
        // Navigate back to dashboard or reload
        navigate('/main/dashboard');
    };

    const handleSignClick = () => {
        if (!recipientId) {
            alert('Không tìm thấy thông tin người ký');
            return;
        }

        // Kiểm tra recipient có quyền ký không (signType = 6)
        if (recipient && recipient.signType !== 6) {
            alert('Người này không có quyền ký số. Vui lòng kiểm tra lại.');
            return;
        }

        setShowSignDialog(true);
    };

    const handleSignSuccess = async (signedData) => {
        console.log('Contract signed successfully:', signedData);
        alert('Ký hợp đồng thành công!');
        
        // Reload contract data để cập nhật trạng thái
        try {
            const contractResponse = await contractService.getContractById(contractId);
            if (contractResponse?.code === 'SUCCESS') {
                setContract(contractResponse.data);
            }

            // Reload fields để cập nhật trạng thái field đã ký
            const fieldsResponse = await contractService.getFieldsByContract(contractId);
            if (fieldsResponse?.code === 'SUCCESS') {
                setFields(fieldsResponse.data || []);
            }

            // Reload recipient
            if (recipientId) {
                const recipientResponse = await contractService.getRecipientById(recipientId);
                if (recipientResponse?.code === 'SUCCESS') {
                    setRecipient(recipientResponse.data);
                }
            }
        } catch (err) {
            console.error('Error reloading data after signing:', err);
        }

        setShowSignDialog(false);
    };

    const handleCoordinate = () => {
        setShowCoordinate(true);
        setCoordinateStep(1);
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
        alert('Điều phối thành công!');
        // Có thể reload contract data hoặc navigate
        setShowCoordinate(false);
    };

    const handleCoordinateError = (error) => {
        console.error('Lỗi điều phối:', error);
    };

    const handleBack = () => {
        navigate(-1);
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
            <div className="contract-loading-container">
                <div className="contract-loading-content">
                    <div className="contract-loading-spinner"></div>
                    <p className="contract-loading-text">Đang tải dữ liệu...</p>
                    <p className="contract-loading-subtext">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
        );
    }

    // Nếu đang hiển thị CoordinateAssigners
    if (showCoordinate) {
        return (
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
        );
    }

    return (
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
                                <span>{contract?.status || 'Chưa xác định'}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian tạo:</label>
                                <span>{formatDate(contract?.createdAt) || 'Chưa có'}</span>
                            </div>
                            
                            <button 
                                className="signing-info-btn" 
                                onClick={() => setShowSigningInfo(!showSigningInfo)}
                            >
                                Thông tin ký
                                <span className="arrow-icon">{showSigningInfo ? '▼' : '›'}</span>
                            </button>

                            {showSigningInfo && (
                                <div className="signing-info-panel">
                                    <p>Thông tin ký sẽ được hiển thị ở đây</p>
                                </div>
                            )}

                            {type === 'review' && (
                                <div className="sign-confirmation-section">
                                    <h3 className="section-title">XEM XÉT TÀI LIỆU</h3>
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
                                                    onChange={() => setReviewDecision('agree')}
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

                            {type === 'sign' && (
                                <div className="sign-confirmation-section">
                                    <h3 className="section-title">KÝ TÀI LIỆU</h3>
                                    <div className="confirmation-content">
                                        <p className="confirmation-question">
                                            Bạn có đồng ý với nội dung, các điều khoản trong tài liệu và sử dụng phương thức điện tử để thực hiện giao dịch không?
                                        </p>
                                        <p className="confirmation-note">
                                            Vui lòng nhấn nút "Ký hợp đồng" để thực hiện ký số bằng chứng thư số.
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
                        />
                    ) : (
                        <div className="pdf-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang chuẩn bị URL tài liệu...</p>
                        </div>
                    )}
                </div>

                {/* Nút hành động */}
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
                        <button className="approve-btn" onClick={handleSignClick}>
                            Ký hợp đồng
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
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
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
                fields={fields}
                onSigned={handleSignSuccess}
            />
        </div>
    );
}

export default ContractDetail;

