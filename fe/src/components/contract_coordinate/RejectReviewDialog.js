import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';
import AnnotationToolbar from './AnnotationToolbar';
import contractService from '../../api/contractService';
import '../../styles/rejectReviewDialog.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - dùng local giống PDFViewer
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * RejectReviewDialog Component
 * 
 * A fullscreen dialog for rejecting contract review with PDF annotation capabilities.
 * Allows users to draw annotations on PDF pages and provide a rejection reason.
 * 
 * Props:
 * - open: boolean - Whether the dialog is open
 * - onClose: function() - Callback to close the dialog
 * - contractId: number - The contract ID
 * - recipientId: number - The recipient ID
 * - documentMeta: object - { id, name, presignedUrl, totalPages }
 * - onRejected: function() - Callback when rejection is successful
 */
function RejectReviewDialog({ 
    open, 
    onClose, 
    contractId, 
    recipientId, 
    documentMeta,
    onRejected
}) {
    // State for drawing tools
    const [currentTool, setCurrentTool] = useState(null);
    const [strokes, setStrokes] = useState([]);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [activePage, setActivePage] = useState(1);
    
    // State for PDF viewing
    const [numPages, setNumPages] = useState(documentMeta?.totalPages || 1);
    const [pdfScale, setPdfScale] = useState(1.0);
    
    // State for drawing
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState(null);
    const canvasRefs = useRef({});
    const containerRef = useRef(null);
    
    // State for rejection
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
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
                        top: 24,
                        right: 24,
                        zIndex: 11000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}
                >
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                minWidth: 240,
                                maxWidth: 380,
                                padding: '10px 14px',
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
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    marginLeft: 10,
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

    useEffect(() => {
        if (!open) {
            // Reset state when dialog closes
            setCurrentTool(null);
            setStrokes([]);
            setUndoStack([]);
            setRedoStack([]);
            setActivePage(1);
            setReason('');
            setReasonError('');
            setLoading(false);
            setUploadProgress('');
        }
    }, [open]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;
            
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, strokes, undoStack]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleToolSelect = (tool) => {
        setCurrentTool(currentTool === tool ? null : tool);
    };

    const handleUndo = () => {
        if (strokes.length === 0) return;
        
        const lastStroke = strokes[strokes.length - 1];
        setUndoStack([...undoStack, lastStroke]);
        setStrokes(strokes.slice(0, -1));
        setRedoStack([]);
    };

    const handleRedo = () => {
        if (undoStack.length === 0) return;
        
        const lastUndo = undoStack[undoStack.length - 1];
        setStrokes([...strokes, lastUndo]);
        setUndoStack(undoStack.slice(0, -1));
    };

    const handleErase = () => {
        if (strokes.length === 0) return;
        
        // Remove the most recent stroke for the current page
        const pageStrokes = strokes.filter(s => s.page === activePage);
        if (pageStrokes.length > 0) {
            const lastPageStroke = pageStrokes[pageStrokes.length - 1];
            const strokeIndex = strokes.lastIndexOf(lastPageStroke);
            if (strokeIndex !== -1) {
                const newStrokes = strokes.filter((_, idx) => idx !== strokeIndex);
                const removedStroke = strokes[strokeIndex];
                setStrokes(newStrokes);
                setUndoStack([...undoStack, removedStroke]);
            }
        }
    };

    const getStrokeBounds = (stroke) => {
        if (!stroke?.points?.length) return null;

        if (stroke.type === 'rectangle' && stroke.points.length >= 2) {
            const [p1, p2] = stroke.points;
            return {
                minX: Math.min(p1.x, p2.x),
                maxX: Math.max(p1.x, p2.x),
                minY: Math.min(p1.y, p2.y),
                maxY: Math.max(p1.y, p2.y)
            };
        }

        const xs = stroke.points.map(p => p.x);
        const ys = stroke.points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        if (stroke.type === 'text') {
            return {
                minX,
                maxX: maxX + 60,
                minY: minY - 14,
                maxY
            };
        }

        return { minX, maxX, minY, maxY };
    };

    const findStrokeAtPosition = (pos) => {
        const tolerance = 6;
        const pageStrokes = strokes.filter(s => s.page === activePage);

        for (let i = pageStrokes.length - 1; i >= 0; i--) {
            const stroke = pageStrokes[i];
            const bounds = getStrokeBounds(stroke);
            if (!bounds) continue;

            if (
                pos.x >= bounds.minX - tolerance &&
                pos.x <= bounds.maxX + tolerance &&
                pos.y >= bounds.minY - tolerance &&
                pos.y <= bounds.maxY + tolerance
            ) {
                return stroke;
            }
        }
        return null;
    };

    // Scroll tới một trang cụ thể trong viewer
    const scrollToPage = (pageNumber) => {
        const container = containerRef.current;
        const canvas = canvasRefs.current[pageNumber];
        if (!container || !canvas) return;

        const containerRect = container.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const offset = canvasRect.top - containerRect.top + container.scrollTop - 20; // trừ nhẹ margin trên

        container.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    };

    // Cập nhật activePage khi user scroll (dựa trên canvas gần đỉnh nhất)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let rafId = null;

        const handleScrollNow = () => {
            const containerTop = container.getBoundingClientRect().top;
            let bestPage = activePage;
            let bestDist = Infinity;

            const refs = canvasRefs.current || {};
            Object.keys(refs).forEach((pageKey) => {
                const canvas = refs[pageKey];
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const dist = Math.abs(rect.top - containerTop);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestPage = Number(pageKey);
                }
            });

            if (bestPage !== activePage) {
                setActivePage(bestPage);
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
        // Sync lần đầu
        handleScrollNow();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [activePage]);

    // Canvas drawing handlers
    const getMousePos = (e, pageNumber) => {
        const canvas = canvasRefs.current[pageNumber];
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / pdfScale,
            y: (e.clientY - rect.top) / pdfScale
        };
    };

    const handleMouseDown = (e, pageNumber) => {
        if (!currentTool) return;
        
        const pos = getMousePos(e, pageNumber);
        setActivePage(pageNumber);
        
        if (currentTool === 'eraser') {
            const strokeToRemove = findStrokeAtPosition(pos);
            if (strokeToRemove) {
                setStrokes(prev => prev.filter(stroke => stroke.id !== strokeToRemove.id));
                setUndoStack(prev => [...prev, strokeToRemove]);
                setRedoStack([]);
            }
            return;
        }
        
        const newStroke = {
            id: Date.now(),
            type: currentTool,
            page: pageNumber,
            points: [pos],
            color: rgb(1, 0, 0), // Red color
            text: currentTool === 'text' ? '' : undefined
        };
        
        setCurrentStroke(newStroke);
        setIsDrawing(true);
        
        if (currentTool === 'text') {
            // For text tool, prompt for input immediately
            const text = prompt('Nhập văn bản:');
            if (text) {
                newStroke.text = text;
                setStrokes([...strokes, newStroke]);
                setRedoStack([]);
            }
            setIsDrawing(false);
            setCurrentStroke(null);
        }
    };

    const handleMouseMove = (e, pageNumber) => {
        if (!isDrawing || !currentStroke || currentTool === 'text') return;
        
        const pos = getMousePos(e, pageNumber);
        
        if (currentTool === 'freehand') {
            setCurrentStroke({
                ...currentStroke,
                points: [...currentStroke.points, pos]
            });
        } else if (currentTool === 'line' || currentTool === 'rectangle') {
            setCurrentStroke({
                ...currentStroke,
                points: [currentStroke.points[0], pos]
            });
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentStroke) return;
        
        setStrokes([...strokes, currentStroke]);
        setCurrentStroke(null);
        setIsDrawing(false);
        setRedoStack([]);
    };

    // Redraw canvas with all strokes (từng trang riêng)
    useEffect(() => {
        const refs = canvasRefs.current || {};
        Object.keys(refs).forEach((pageKey) => {
            const pageNum = Number(pageKey);
            const canvas = refs[pageKey];
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all strokes for this page
            const pageStrokes = strokes.filter(s => s.page === pageNum);
            pageStrokes.forEach(stroke => drawStroke(ctx, stroke));

            // Draw current stroke being drawn trên trang này
            if (currentStroke && currentStroke.page === pageNum) {
                drawStroke(ctx, currentStroke);
            }
        });
    }, [strokes, currentStroke, pdfScale]);

    const drawStroke = (ctx, stroke) => {
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.lineWidth = 2 * pdfScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const points = stroke.points.map(p => ({
            x: p.x * pdfScale,
            y: p.y * pdfScale
        }));
        
        if (stroke.type === 'freehand') {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        } else if (stroke.type === 'line') {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
        } else if (stroke.type === 'rectangle') {
            if (points.length < 2) return;
            const width = points[1].x - points[0].x;
            const height = points[1].y - points[0].y;
            ctx.strokeRect(points[0].x, points[0].y, width, height);
        } else if (stroke.type === 'text' && stroke.text) {
            ctx.font = `${14 * pdfScale}px Arial`;
            ctx.fillText(stroke.text, points[0].x, points[0].y);
        }
    };

    const handleSubmit = async () => {
        // Validate reason
        if (!reason.trim()) {
            setReasonError('Vui lòng nhập lý do từ chối');
            return;
        }
        
        setReasonError('');
        setLoading(true);
        
        try {
            // Step 1: Load the original PDF
            setUploadProgress('Đang tải PDF gốc...');
            const pdfBytes = await fetch(documentMeta.presignedUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            // Step 2: Draw annotations on each page
            setUploadProgress('Đang thêm chú thích...');
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = pdfDoc.getPages()[pageNum - 1];
                const { width, height } = page.getSize();
                
                // Get strokes for this page
                const pageStrokes = strokes.filter(s => s.page === pageNum);
                
                // Draw each stroke
                for (const stroke of pageStrokes) {
                    if (stroke.type === 'freehand') {
                        // Draw freehand path
                        for (let i = 0; i < stroke.points.length - 1; i++) {
                            const p1 = stroke.points[i];
                            const p2 = stroke.points[i + 1];
                            page.drawLine({
                                start: { x: p1.x, y: height - p1.y },
                                end: { x: p2.x, y: height - p2.y },
                                thickness: 2,
                                color: rgb(1, 0, 0)
                            });
                        }
                    } else if (stroke.type === 'line' && stroke.points.length >= 2) {
                        const p1 = stroke.points[0];
                        const p2 = stroke.points[1];
                        page.drawLine({
                            start: { x: p1.x, y: height - p1.y },
                            end: { x: p2.x, y: height - p2.y },
                            thickness: 2,
                            color: rgb(1, 0, 0)
                        });
                    } else if (stroke.type === 'rectangle' && stroke.points.length >= 2) {
                        const p1 = stroke.points[0];
                        const p2 = stroke.points[1];
                        const rectWidth = Math.abs(p2.x - p1.x);
                        const rectHeight = Math.abs(p2.y - p1.y);
                        page.drawRectangle({
                            x: Math.min(p1.x, p2.x),
                            y: height - Math.max(p1.y, p2.y),
                            width: rectWidth,
                            height: rectHeight,
                            borderColor: rgb(1, 0, 0),
                            borderWidth: 2
                        });
                    } else if (stroke.type === 'text' && stroke.text) {
                        const p = stroke.points[0];
                        page.drawText(stroke.text, {
                            x: p.x,
                            y: height - p.y,
                            size: 14,
                            color: rgb(1, 0, 0)
                        });
                    }
                }
            }
            
            // Step 3: Export annotated PDF
            setUploadProgress('Đang xuất PDF...');
            const annotatedPdfBytes = await pdfDoc.save();
            const annotatedPdfBlob = new Blob([annotatedPdfBytes], { type: 'application/pdf' });
            const annotatedPdfFile = new File([annotatedPdfBlob], 'annotated.pdf', { type: 'application/pdf' });
            
            // Step 4: Upload the annotated PDF
            setUploadProgress('Đang tải lên PDF đã chú thích...');
            
            // First upload to get document URL
            const uploadResponse = await contractService.uploadDocument(annotatedPdfFile);
            if (uploadResponse?.code !== 'SUCCESS') {
                throw new Error('Tải lên tài liệu thất bại');
            }
            
            const { path, fileName } = uploadResponse.data || {};
            if (!path || !fileName) {
                throw new Error('Thiếu thông tin file sau khi tải lên');
            }
            
            // Create document record (lưu file chú thích như file đính kèm)
            const createDocResponse = await contractService.createDocument({
                name: `Rejection_${documentMeta.name}`,
                contractId: contractId,
                type: 9,        
                fileName: fileName,
                path: path,
                status: 1
            });
            
            if (createDocResponse?.code !== 'SUCCESS') {
                throw new Error('Tạo bản ghi tài liệu thất bại');
            }
            
            // Step 5: Change contract status to REJECTED
            setUploadProgress('Đang xử lý từ chối...');
            const rejectResponse = await contractService.changeContractStatus(
                contractId,
                31, // REJECTED status
                reason
            );
            
            if (rejectResponse?.code !== 'SUCCESS') {
                throw new Error(rejectResponse?.message || 'Từ chối hợp đồng thất bại');
            }
            
            // Success
            showToast('Từ chối hợp đồng thành công!', 'success');
            setTimeout(() => {
                onRejected();
                onClose();
            }, 1200);
            
        } catch (error) {
            console.error('Error submitting rejection:', error);
            showToast(error.message || 'Có lỗi xảy ra khi xử lý từ chối', 'error');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    if (!open) return null;

    // Determine cursor style based on current tool
    const getCursorStyle = () => {
        if (!currentTool) return 'default';
        if (currentTool === 'text') return 'text';
        if (currentTool === 'eraser') return 'pointer';
        return 'crosshair';
    };

    return (
        <div className="reject-dialog-overlay">
            <ToastStack />
            <div className="reject-dialog-container">
                {/* Header */}
                <div className="reject-dialog-header">
                    <h2>Từ chối xem xét hợp đồng</h2>
                    <button 
                        className="close-btn" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="reject-dialog-content">
                    {/* Left Column - PDF Viewer with Annotation */}
                    <div className="pdf-annotation-column">
                        <h3 className="column-title">Ghi chú chi tiết</h3>
                        
                        {/* Annotation Toolbar + Page Controls */}
                        <div className="annotation-toolbar-row">
                            <AnnotationToolbar
                                currentTool={currentTool}
                                onSelectTool={handleToolSelect}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                onErase={handleErase}
                                canUndo={strokes.length > 0}
                                canRedo={undoStack.length > 0}
                            />
                            <div className="pdf-page-controls">
                                <button
                                    onClick={() => {
                                        const target = Math.max(1, activePage - 1);
                                        setActivePage(target);
                                        scrollToPage(target);
                                    }}
                                    disabled={activePage === 1}
                                >
                                    ‹ Trước
                                </button>
                                <span>Trang {activePage} / {numPages}</span>
                                <button
                                    onClick={() => {
                                        const target = Math.min(numPages, activePage + 1);
                                        setActivePage(target);
                                        scrollToPage(target);
                                    }}
                                    disabled={activePage === numPages}
                                >
                                    Sau ›
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer with Canvas Overlay */}
                        <div 
                            className="pdf-viewer-container" 
                            style={{ cursor: getCursorStyle() }}
                        >
                            {/* phần scroll chính nằm ở pdf-viewer-inner */}
                            <div className="pdf-viewer-inner" ref={containerRef}>
                                <Document
                                    file={documentMeta.presignedUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={<div className="pdf-loading">Đang tải PDF...</div>}
                                    error={<div className="pdf-error">Lỗi tải PDF</div>}
                                >
                                    {Array.from({ length: numPages }, (_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <div
                                                key={pageNumber}
                                                className="reject-pdf-page-wrapper"
                                            >
                                                <Page
                                                    pageNumber={pageNumber}
                                                    scale={pdfScale}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                                {/* Canvas overlay cho từng trang riêng */}
                                                <canvas
                                                    ref={(el) => {
                                                        if (el) {
                                                            canvasRefs.current[pageNumber] = el;
                                                        } else {
                                                            delete canvasRefs.current[pageNumber];
                                                        }
                                                    }}
                                                    className="annotation-canvas"
                                                    width={595 * pdfScale}
                                                    height={842 * pdfScale}
                                                    onMouseDown={(e) => handleMouseDown(e, pageNumber)}
                                                    onMouseMove={(e) => handleMouseMove(e, pageNumber)}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseUp}
                                                />
                                            </div>
                                        );
                                    })}
                                </Document>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Rejection Reason */}
                    <div className="rejection-reason-column">
                        <h3 className="column-title">Lý do từ chối</h3>
                        
                        <div className="reason-input-container">
                            <textarea
                                className={`reason-textarea ${reasonError ? 'error' : ''}`}
                                placeholder="Nhập lý do từ chối"
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (reasonError && e.target.value.trim()) {
                                        setReasonError('');
                                    }
                                }}
                                rows={10}
                                disabled={loading}
                            />
                            {reasonError && (
                                <div className="reason-error">{reasonError}</div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="rejection-instructions">
                            <h4>Hướng dẫn:</h4>
                            <ul>
                                <li>Sử dụng các công cụ để đánh dấu trên tài liệu</li>
                                <li>Nhập lý do từ chối cụ thể</li>
                                <li>Nhấn "Xác nhận từ chối" để hoàn tất</li>
                            </ul>
                        </div>

                        {/* Progress Indicator */}
                        {loading && uploadProgress && (
                            <div className="upload-progress">
                                <div className="progress-spinner"></div>
                                <div className="progress-text">{uploadProgress}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="reject-dialog-footer">
                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="confirm-reject-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RejectReviewDialog;

