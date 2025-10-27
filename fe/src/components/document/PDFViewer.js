import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import '../../styles/pdfViewer.css';

// Cấu hình worker: dùng file worker local trong public để tránh CORS
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFViewer({ document, currentPage, totalPages, zoom, onPageChange }) {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(false);
    const documentRef = useRef(null);
    const containerRef = useRef(null);
    const pageRefs = useRef([]);
    const lastDerivedPageRef = useRef(null); // trang tính được từ scroll gần nhất
    const isProgrammaticScrollRef = useRef(false); // đang scroll do code

    // URL PDF mẫu - trong thực tế sẽ lấy từ document.pdfUrl
    const pdfUrl = document?.pdfUrl || 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
        setPageError(false);
    }

    function onDocumentLoadError(error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
        setPageError(true);
    }

    // Reset loading state khi document thay đổi
    useEffect(() => {
        setLoading(true);
        setPageError(false);
    }, [pdfUrl]);

    // Scroll tới trang khi currentPage thay đổi từ bên ngoài (khác trang do scroll tính ra)
    useEffect(() => {
        if (!numPages || !currentPage) return;
        if (lastDerivedPageRef.current === currentPage) return; // thay đổi do scroll, bỏ qua
        const targetEl = pageRefs.current[currentPage - 1];
        if (targetEl) {
            isProgrammaticScrollRef.current = true;
            targetEl.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
            // kết thúc cờ sau một frame
            requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
        }
    }, [currentPage, numPages]);

    // Cập nhật currentPage dựa theo vị trí scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !numPages) return;

        let rafId = null;
        const handleScrollNow = () => {
            const containerTop = container.getBoundingClientRect().top;
            let bestPage = 1;
            let bestDist = Infinity;
            pageRefs.current.forEach((el, idx) => {
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const dist = Math.abs(rect.top - containerTop);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestPage = idx + 1;
                }
            });
            lastDerivedPageRef.current = bestPage;
            if (!isProgrammaticScrollRef.current && bestPage !== currentPage && typeof onPageChange === 'function') {
                onPageChange(bestPage);
            }
        };
        const handleScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                handleScrollNow();
            });
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        // Gọi 1 lần để sync ngay
        handleScroll();
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [numPages, currentPage, onPageChange]);

    // Tạo ref cho từng trang
    const setPageRef = (index) => (el) => {
        pageRefs.current[index] = el;
    };

    return (
        <div className="pdf-viewer-container" ref={containerRef}>
            <Document
                ref={documentRef}
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                    <div className="pdf-loading">
                        <div className="loading-spinner"></div>
                        <p>Đang tải tài liệu...</p>
                    </div>
                }
                error={
                    <div className="pdf-error">
                        <p>Không thể tải tài liệu PDF</p>
                        <p className="error-detail">Vui lòng thử lại sau</p>
                    </div>
                }
            >
                {!pageError && !loading && numPages && (
                    Array.from({ length: numPages }, (_, i) => (
                        <div key={i} data-page-index={i} ref={setPageRef(i)}>
                            <Page
                                pageNumber={i + 1}
                                scale={zoom / 100}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading={
                                    <div className="pdf-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Đang tải trang...</p>
                                    </div>
                                }
                            />
                        </div>
                    ))
                )}
            </Document>
        </div>
    );
}

export default PDFViewer;
