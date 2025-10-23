import React, { useState } from 'react';
import '../../styles/documentDetail.css';
import PDFViewer from './PDFViewer';

function DocumentDetail({ document, onBack }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(14);
    const [zoom, setZoom] = useState(100);

    // Dữ liệu mẫu cho các bên liên quan
    const relatedParties = [
        { id: 1, name: "Nguyễn Văn A", role: "Người ký", status: "Đã ký" },
        { id: 2, name: "Trần Thị B", role: "Người duyệt", status: "Chờ duyệt" },
        { id: 3, name: "Lê Văn C", role: "Người xem", status: "Đã xem" }
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
                    <>
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
                            <button className="process-flow-btn">
                                Luồng xử lý tài liệu
                                <span className="arrow-icon">›</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Nội dung chính bên phải */}
            <div className="document-content">
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
                    <button className="finish-btn">Kết thúc</button>
                </div>
            </div>
        </div>
    );
}

export default DocumentDetail;
