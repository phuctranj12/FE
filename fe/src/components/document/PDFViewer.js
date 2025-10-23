import React, { useState, useEffect } from 'react';

// Component PDF Viewer đơn giản
// Để hiển thị PDF thực tế, bạn cần cài đặt thư viện:
// npm install react-pdf
// hoặc
// npm install pdfjs-dist

function PDFViewer({ document, currentPage, totalPages, zoom, onPageChange }) {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        // Trong thực tế, bạn sẽ lấy URL PDF từ document
        // setPdfUrl(document.pdfUrl);
        
        // Hiện tại sử dụng PDF mẫu
        setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }, [document]);

    return (
        <div className="pdf-viewer-container">
            {pdfUrl ? (
                <div className="pdf-iframe-container">
                    <iframe
                        src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="PDF Viewer"
                    />
                </div>
            ) : (
                <div className="pdf-placeholder">
                    <div className="pdf-content">
                        {/* Nội dung PDF mẫu - trong thực tế sẽ sử dụng thư viện PDF viewer */}
                        <div className="pdf-page">
                            <div className="pdf-header">
                                <div className="institution-left">
                                    HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
                                </div>
                                <div className="institution-right">
                                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
                                    Độc Lập - Tự Do - Hạnh Phúc
                                </div>
                            </div>
                            
                            <div className="pdf-title">
                                KHOA CÔNG NGHỆ THÔNG TIN
                            </div>
                            
                            <div className="pdf-main-title">
                                ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
                            </div>
                            
                            <div className="course-name">
                                Tên học phần: Đồ án tốt nghiệp (Capstone Project)
                            </div>
                            
                            <div className="section-title">
                                1. Thông tin chung về học phần
                            </div>
                            
                            <div className="info-table">
                                <div className="table-row">
                                    <div className="table-cell">1) Mã học phần:</div>
                                    <div className="table-cell">INT</div>
                                </div>
                                <div className="table-row">
                                    <div className="table-cell">2) Ký hiệu học phần:</div>
                                    <div className="table-cell"></div>
                                </div>
                                <div className="table-row">
                                    <div className="table-cell">3) Số tín chỉ:</div>
                                    <div className="table-cell">6</div>
                                </div>
                                <div className="table-row">
                                    <div className="table-cell">4) Hoạt động học tập</div>
                                    <div className="table-cell">
                                        - Lý thuyết: 0 tiết<br/>
                                        - Bài tập/Thảo luận: 0 tiết<br/>
                                        - Thực hành/Thí nghiệm: 0 tiết<br/>
                                        - Tự học: 90 tiết
                                    </div>
                                </div>
                                <div className="table-row">
                                    <div className="table-cell">5) Điều kiện tham gia học phần:</div>
                                    <div className="table-cell">
                                        - Học phần tiên quyết: Các học phần đại cương, cơ sở ngành và chuyên ngành liên quan.<br/>
                                        - Học phần học trước:
                                    </div>
                                </div>
                                <div className="table-row">
                                    <div className="table-cell">6) Các giảng viên phụ trách học phần:</div>
                                    <div className="table-cell"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PDFViewer;
