import React, { useState } from 'react';
import '../../styles/templateDetail.css';
import PDFViewer from '../document/PDFViewer';

function TemplateDetail({ template, onBack, mode = 'view' }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(14);
    const [zoom, setZoom] = useState(100);
    const [showSigningInfo, setShowSigningInfo] = useState(false);
    const [signAgreement, setSignAgreement] = useState(null); // null: chưa chọn, true: đồng ý, false: không đồng ý

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
            case '4':
                return 'Tài liệu hợp đồng theo lô';
            default:
                return 'Chưa xác định';
        }
    };

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
                        <PDFViewer 
                            document={template}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            zoom={zoom}
                            onPageChange={handlePageChange}
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="document-actions">
                        {mode === 'view' ? (
                            <>
                                <button className="edit-btn" onClick={() => {
                                    console.log('Edit template:', template);
                                }}>Chỉnh sửa</button>
                                <button className="finish-btn" onClick={onBack}>Đóng</button>
                            </>
                        ) : (
                            <>
                                <button className="edit-btn" onClick={onBack}>Hủy</button>
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

