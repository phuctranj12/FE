import React, { useState } from 'react';
import '../../styles/documentDetail.css';
import PDFViewer from './PDFViewer';
import DocumentProcessingFlowPanel from '../common/DocumentProcessingFlow';

function DocumentDetail({ document, onBack }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(14);
    const [zoom, setZoom] = useState(100);
    const [showProcessingFlow, setShowProcessingFlow] = useState(false);

    // Dữ liệu mẫu cho các bên liên quan
    const relatedParties = [
        { id: 1, name: "Nguyễn Văn A", role: "Người ký", status: "Đã ký" },
        { id: 2, name: "Trần Thị B", role: "Người duyệt", status: "Chờ duyệt" },
        { id: 3, name: "Lê Văn C", role: "Người xem", status: "Đã xem" }
    ];

    // Dữ liệu mẫu cho luồng xử lý tài liệu
    const workflowSteps = [
        {
            id: 1,
            name: "Nguyễn Quang Minh",
            email: "minhseven2002@gmail.com",
            details: [],
            status: "Người khởi tạo",
            timestamp: "2025/09/22 14:51:54",
            action_icon: null,
            show_operations: false
        },
        {
            id: 2,
            name: "Trần Văn B",
            email: "tranvanb@example.com",
            details: [
                "Phòng Kinh doanh",
                "Loại ký : Ký số bằng USB Token",
                "MST/CCCD: 0100686209-167"
            ],
            status: "Chờ ký",
            timestamp: "2025/09/22 14:52:00",
            action_icon: null,
            show_operations: true
        },
        {
            id: 3,
            name: "Nguyễn Quang Minh",
            email: "minhseven2002@gmail.com",
            details: [
                "Trung tâm công nghệ thông tin MobiFone",
                "Loại ký : Ký số bằng HSM",
                "MST/CCCD: 0100686209-166"
            ],
            status: "Đã ký",
            timestamp: "2025/09/22 14:52:22",
            action_icon: "envelope_circle_arrows",
            show_operations: true
        }
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
                                <span>{document?.title || "asd"}</span>
                            </div>
                            <div className="info-item">
                                <label>Mã tài liệu:</label>
                                <span>{document?.code || "dUZrRsr2"}</span>
                            </div>
                            <div className="info-item">
                                <label>Loại tài liệu:</label>
                                <span>{document?.type || ""}</span>
                            </div>
                            <div className="info-item">
                                <label>Số tài liệu:</label>
                                <span>{document?.number || "asd"}</span>
                            </div>
                        </div>

                        {/* Các bên liên quan */}
                        <div className="related-parties-section">
                            <h3 className="section-title">CÁC BÊN LIÊN QUAN</h3>
                            <div className="related-parties-list">
                                {relatedParties.map(party => (
                                    <div key={party.id} className="party-item">
                                        <div className="party-name">{party.name}</div>
                                        <div className="party-role">{party.role}</div>
                                        <div className={`party-status status-${party.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {party.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Nút luồng xử lý tài liệu */}
                            <button className="process-flow-btn" onClick={() => setShowProcessingFlow(true)}>
                                Luồng xử lý tài liệu
                                <span className="arrow-icon">›</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Nội dung chính bên phải */}
            <div className="document-content">
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
                            document={document}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            zoom={zoom}
                            onPageChange={handlePageChange}
                        />
                    </div>

                    {/* Nút Kết thúc */}
                    <div className="document-actions">
                        <button className="edit-btn" onClick={() => {
                            // Trigger navigation to DocumentEditor
                            window.dispatchEvent(new CustomEvent('navigate-to-editor'));
                        }}>Chỉnh sửa</button>
                        <button className="finish-btn">Kết thúc</button>
                    </div>
                </div>
            </div>

            {/* Modal Luồng xử lý tài liệu */}
            {showProcessingFlow && (
                <DocumentProcessingFlowPanel
                    onClose={() => setShowProcessingFlow(false)}
                    workflowSteps={workflowSteps}
                />
            )}
        </div>
    );
}

export default DocumentDetail;
