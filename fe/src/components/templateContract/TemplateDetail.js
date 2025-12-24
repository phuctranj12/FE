import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/templateDetail.css';
import PDFViewer from '../document/PDFViewer';
import contractService from '../../api/contractService';

function TemplateDetail({ mode = 'view' }) {
    const { template_contract_id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(14);
    const [zoom, setZoom] = useState(100);
    const [showSigningInfo, setShowSigningInfo] = useState(false);
    const [signAgreement, setSignAgreement] = useState(null); // null: chưa chọn, true: đồng ý, false: không đồng ý
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [templateFields, setTemplateFields] = useState([]);
    const [templateParticipants, setTemplateParticipants] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dữ liệu mẫu cho thông tin ký
    const signingInfo = [
        { id: 1, name: "Nguyễn Văn A", role: "Người ký", signType: "Ký số bằng USB Token" },
        { id: 2, name: "Trần Thị B", role: "Người duyệt", signType: "Ký số bằng HSM" }
    ];

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

    const getDocumentTypeLabel = (typeId) => {
        switch (typeId) {
            case '1':
                return 'Tài liệu gốc';
            case '2':
                return 'Tài liệu khách hàng';
            case '3':
                return 'Tài liệu đính kèm';
            default:
                return 'Chưa xác định';
        }
    };

    // Load template data từ API khi component mount hoặc template_contract_id thay đổi
    useEffect(() => {
        const loadTemplate = async () => {
            if (!template_contract_id) {
                console.warn('[TemplateDetail] No template_contract_id in URL');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await contractService.getTemplateContractById(template_contract_id);
                if (response?.code === 'SUCCESS') {
                    setTemplate(response.data);
                } else {
                    console.error('[TemplateDetail] Error loading template:', response);
                    setPdfError(response?.message || 'Không thể tải thông tin template');
                }
            } catch (err) {
                console.error('[TemplateDetail] Error loading template:', err);
                setPdfError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin template');
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [template_contract_id]);

    // Load presigned URL và template fields khi template thay đổi
    useEffect(() => {
        const loadTemplateData = async () => {
            if (!template) return;

            // Lấy contractId từ template (có thể là id hoặc contractId)
            const contractId = template.id || template.contractId;
            if (!contractId) {
                console.warn('[TemplateDetail] No contractId found in template:', template);
                return;
            }

            try {
                setPdfLoading(true);
                setPdfError(null);

                // Bước 1: Lấy danh sách template documents theo contractId
                const documentsResponse = await contractService.getTemplateDocumentsByContract(contractId);
                
                if (documentsResponse?.code === 'SUCCESS' && documentsResponse.data?.length > 0) {
                    // Lấy document đầu tiên (thường là tài liệu gốc - type = 1)
                    const document = Array.isArray(documentsResponse.data) 
                        ? documentsResponse.data[0] 
                        : documentsResponse.data;
                    
                    if (document?.id) {
                        // Bước 2: Lấy presigned URL cho document
                        const urlResponse = await contractService.getTemplateDocumentPresignedUrl(document.id);
                        
                        if (urlResponse?.code === 'SUCCESS') {
                            // URL có thể ở nhiều vị trí trong response
                            const url = typeof urlResponse.data === 'string' 
                                ? urlResponse.data 
                                : (urlResponse.data?.url || urlResponse.data?.message || urlResponse.url);
                            
                            if (url) {
                                setPdfUrl(url);
                                setPdfError(null);
                                
                                // Cập nhật totalPages nếu có thông tin từ document
                                if (document.page) {
                                    setTotalPages(document.page);
                                }
                                
                                console.log('[TemplateDetail] PDF URL loaded:', url);
                            } else {
                                console.error('[TemplateDetail] No URL in response:', urlResponse);
                                setPdfError('Không tìm thấy URL trong phản hồi từ server');
                            }
                        } else {
                            const errorMsg = urlResponse?.message || 'Không thể lấy URL tài liệu';
                            console.error('[TemplateDetail] API error:', errorMsg, urlResponse);
                            setPdfError(errorMsg);
                        }
                    } else {
                        console.error('[TemplateDetail] No document ID found:', document);
                        setPdfError('Không tìm thấy ID tài liệu');
                    }
                } else {
                    const errorMsg = documentsResponse?.message || 'Không tìm thấy tài liệu mẫu';
                    console.error('[TemplateDetail] No documents found:', errorMsg, documentsResponse);
                    setPdfError(errorMsg);
                }

                // Bước 3: Lấy template fields
                try {
                    const fieldsResponse = await contractService.getTemplateFieldsByContract(contractId);
                    if (fieldsResponse?.code === 'SUCCESS') {
                        const fields = Array.isArray(fieldsResponse.data) ? fieldsResponse.data : [];
                        setTemplateFields(fields);
                        console.log('[TemplateDetail] Template fields loaded:', fields);
                    }
                } catch (fieldsErr) {
                    console.warn('[TemplateDetail] Error loading template fields:', fieldsErr);
                    // Không set error vì fields không bắt buộc
                }

                // Bước 4: Lấy template participants
                try {
                    const participantsResponse = await contractService.getTemplateParticipantsByContract(contractId);
                    if (participantsResponse?.code === 'SUCCESS') {
                        const participants = Array.isArray(participantsResponse.data) 
                            ? participantsResponse.data 
                            : [];
                        setTemplateParticipants(participants);
                        console.log('[TemplateDetail] Template participants loaded:', participants);
                    }
                } catch (participantsErr) {
                    console.warn('[TemplateDetail] Error loading template participants:', participantsErr);
                    // Không set error vì participants không bắt buộc
                }

            } catch (err) {
                console.error('[TemplateDetail] Error loading template data:', err);
                setPdfError(err?.response?.data?.message || err?.message || 'Không thể tải tài liệu');
            } finally {
                setPdfLoading(false);
            }
        };

        loadTemplateData();
    }, [template]);

    // Convert template fields thành components format cho PDFViewer
    useEffect(() => {
        if (!templateFields || templateFields.length === 0) {
            setComponents([]);
            return;
        }

        // Tạo map recipientId -> recipient từ template participants
        const recipientMap = new Map();
        if (templateParticipants && templateParticipants.length > 0) {
            templateParticipants.forEach(participant => {
                if (participant.recipients && Array.isArray(participant.recipients)) {
                    participant.recipients.forEach(recipient => {
                        if (recipient.id) {
                            recipientMap.set(recipient.id, recipient);
                        }
                    });
                }
            });
        }

        const convertedComponents = templateFields.map((field, index) => {
            // Map field type về component type
            let componentType = 'text';
            if (field.type === 4) componentType = 'document-number';
            else if (field.type === 2) componentType = 'image-signature';
            else if (field.type === 3) componentType = 'digital-signature';

            // Tìm recipient từ recipientId
            const recipient = field.recipientId ? recipientMap.get(field.recipientId) : null;
            
            // Sử dụng recipient name nếu có, nếu không thì dùng field name
            const displayName = recipient?.name || field.name || 'Field';

            return {
                id: field.id || `field-${index}`,
                fieldId: field.id,
                type: componentType,
                name: displayName, // Hiển thị recipient name thay vì field name
                page: parseInt(field.page) || 1,
                properties: {
                    x: field.boxX || 0,
                    y: field.boxY || 0,
                    width: field.boxW || 100,
                    height: field.boxH || 30,
                    font: field.font || 'Times New Roman',
                    size: field.fontSize || 13,
                    fieldName: field.name || '',
                    recipientId: field.recipientId,
                    ordering: field.ordering || index + 1
                },
                recipient: recipient, // Thêm recipient object để PDFViewer có thể hiển thị
                locked: true, // Template fields chỉ để xem, không cho edit
                highlight: true,
                highlightType: (field.type === 2 || field.type === 3) ? 'sign' : 'info'
            };
        });

        setComponents(convertedComponents);
    }, [templateFields, templateParticipants]);

    return (
        <div className="document-detail-container">
            {/* Sidebar bên trái */}
            <div className={`document-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Nút ẩn sidebar */}
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <span className={`toggle-icon ${sidebarCollapsed ? 'collapsed' : ''}`}>‹</span>
                </button>

                {!sidebarCollapsed && (
                    <div className="sidebar-content-container">
                        {/* Thông tin chi tiết tài liệu */}
                        <div className="document-info-section">
                            <h3 className="section-title">THÔNG TIN CHI TIẾT TÀI LIỆU</h3>
                            <div className="info-item">
                                <label>Tên tài liệu:</label>
                                <span>{template?.name || template?.templateId || 'Chưa có tên'}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã tài liệu:</label>
                                <span>{template?.contractCode || template?.id || 'Chưa có mã'}</span>
                            </div>
                            <div className="info-item">
                                <label>Loại tài liệu:</label>
                                <span>{getDocumentTypeLabel(template?.type_id)}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian tạo:</label>
                                <span>{formatDate(template?.created_at) || formatDate(template?.start_time) || 'Chưa có'}</span>
                            </div>
                            <div className="info-item">
                                <label>Thời gian hiệu lực:</label>
                                <span>
                                    {template?.start_time && template?.end_time 
                                        ? `${formatDate(template.start_time)} - ${formatDate(template.end_time)}`
                                        : formatDate(template?.end_time) || formatDate(template?.date) || 'Chưa có'}
                                </span>
                            </div>
                            
                            {/* Button Thông tin ký */}
                            <button 
                                className="signing-info-btn" 
                                onClick={() => setShowSigningInfo(!showSigningInfo)}
                            >
                                Thông tin ký
                                <span className="arrow-icon">{showSigningInfo ? '▼' : '›'}</span>
                            </button>

                            {/* Hiển thị thông tin ký khi được mở */}
                            {showSigningInfo && (
                                <div className="signing-info-panel">
                                    {signingInfo.map(signer => (
                                        <div key={signer.id} className="signer-item">
                                            <div className="signer-name">{signer.name}</div>
                                            <div className="signer-role">{signer.role}</div>
                                            <div className="signer-type">{signer.signType}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Xác nhận ký tài liệu - chỉ hiển thị khi mode='sign' */}
                        {mode === 'sign' && (
                            <div className="sign-confirmation-section">
                                <h3 className="section-title">XÁC NHẬN KÝ TÀI LIỆU</h3>
                                <div className="confirmation-content">
                                    <p className="confirmation-question">
                                        Bạn có đồng ý với nội dung, các điều khoản trong tài liệu và sử dụng phương thức điện tử để thực hiện giao dịch không?
                                    </p>
                                    <div className="radio-options">
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="signAgreement"
                                                value="agree"
                                                checked={signAgreement === true}
                                                onChange={() => setSignAgreement(true)}
                                            />
                                            <span className="radio-label">Đồng ý</span>
                                        </label>
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="signAgreement"
                                                value="disagree"
                                                checked={signAgreement === false}
                                                onChange={() => setSignAgreement(false)}
                                            />
                                            <span className="radio-label">Không đồng ý</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Nội dung chính bên phải */}
          
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
                    <div className="pdf-viewer template-detail-pdf-viewer">
                        {loading && (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div className="loading-spinner"></div>
                                <p>Đang tải thông tin template...</p>
                            </div>
                        )}
                        {pdfLoading && !loading && (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div className="loading-spinner"></div>
                                <p>Đang tải tài liệu...</p>
                            </div>
                        )}
                        {pdfError && !loading && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
                                <p>Lỗi: {pdfError}</p>
                            </div>
                        )}
                        {!loading && !pdfLoading && !pdfError && pdfUrl && (
                            <PDFViewer 
                                document={{ ...template, pdfUrl }}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                zoom={zoom}
                                onPageChange={handlePageChange}
                                components={components}
                                showLockedBadge={true}
                            />
                        )}
                    </div>

                    {/* Nút hành động */}
                    <div className="document-actions">
                        {mode === 'view' ? (
                            <>
                                <button className="edit-btn" onClick={() => {
                                    if (template) {
                                        const templateId = template.id || template.contractId || template_contract_id;
                                        navigate(`/main/contract-template/edit/${templateId}`);
                                    }
                                }}>Chỉnh sửa</button>
                                <button className="finish-btn" onClick={() => navigate('/main/contract-template')}>Đóng</button>
                            </>
                        ) : (
                            <>
                                <button className="edit-btn" onClick={() => navigate('/main/contract-template')}>Hủy</button>
                                <button 
                                    className="finish-btn" 
                                    onClick={() => {
                                        if (signAgreement === true) {
                                            console.log('Tiến hành ký tài liệu');
                                            // Logic ký tài liệu
                                        } else if (signAgreement === false) {
                                            console.log('Người dùng không đồng ý');
                                            alert('Bạn cần đồng ý với các điều khoản để ký tài liệu');
                                        } else {
                                            alert('Vui lòng chọn đồng ý hoặc không đồng ý');
                                        }
                                    }}
                                    disabled={signAgreement !== true}
                                >
                                    Ký tài liệu
                                </button>
                            </>
                        )}
                    </div>
                </div>
        </div>
    );
}

export default TemplateDetail;

