import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import '../../styles/documentDetail.css';
import PDFViewer from '../document/PDFViewer';
import CoordinateAssigners from './CoordinateAssigners';
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
                        // Có thể cần lấy presigned URL nếu cần
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
        // TODO: Implement delegate logic
    };

    const handleReject = () => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối hợp đồng này?')) {
            console.log('Từ chối hợp đồng');
            // TODO: Implement reject logic
        }
    };

    const handleFindSignFields = () => {
        console.log('Tìm ô ký');
        // TODO: Implement find sign fields logic
    };

    const handleFindInfoFields = () => {
        console.log('Tìm ô thông tin');
        // TODO: Implement find info fields logic
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

    if (loading) {
        return (
            <div className="document-detail-container" style={{ padding: '20px', textAlign: 'center' }}>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="document-detail-container" style={{ padding: '20px' }}>
                <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
                <button onClick={handleBack}>Quay lại</button>
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
                    <PDFViewer 
                        document={contract}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        zoom={zoom}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Nút hành động */}
                <div className="document-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="edit-btn" onClick={handleDelegate}>
                        Ủy quyền/Chuyển tiếp
                    </button>
                    <button className="edit-btn" onClick={handleReject}>
                        Từ chối
                    </button>
                    <button className="edit-btn" onClick={handleFindSignFields}>
                        Tìm ô ký
                    </button>
                    <button className="edit-btn" onClick={handleFindInfoFields}>
                        Tìm ô thông tin
                    </button>
                    <button className="finish-btn" onClick={handleCoordinate}>
                        Điều phối
                    </button>
                    <button className="edit-btn" onClick={handleBack}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ContractDetail;

