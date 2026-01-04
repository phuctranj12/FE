import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import '../../styles/pdfViewer.css';

// Cấu hình worker: dùng file worker local trong public để tránh CORS
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFViewer({ 
    document, 
    currentPage, 
    totalPages, 
    zoom, 
    onPageChange,
    components = [],
    editingComponentId = null,
    hoveredComponentId = null,
    isDragging = false,
    draggedComponent = null,
    onComponentClick,
    onComponentMouseDown,
    onComponentMouseEnter,
    onComponentMouseLeave,
    onResizeStart,
    onRemoveComponent,
    autoFitWidth = false, // New prop to enable auto-fit-to-width,
    onScaleChange = null, // Callback to notify parent of scale changes
    focusComponentId = null,
    showLockedBadge = true,
    onTextFieldChange = null, // Callback khi text field thay đổi
    onTextFieldBlur = null // Callback khi text field blur
}) {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(false);
    const [autoScale, setAutoScale] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);
    const documentRef = useRef(null);
    const containerRef = useRef(null);
    const pageRefs = useRef([]);
    const lastDerivedPageRef = useRef(null); // trang tính được từ scroll gần nhất
    const isProgrammaticScrollRef = useRef(false); // đang scroll do code
    const pageWidthsRef = useRef({}); // Store page widths

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
        pageWidthsRef.current = {};
    }, [pdfUrl]);

    // Track container width for auto-fit
    useEffect(() => {
        if (!autoFitWidth || !containerRef.current) return;

        const updateContainerWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                setContainerWidth(width);
            }
        };

        // Initial width
        updateContainerWidth();

        // Use ResizeObserver to track width changes
        const resizeObserver = new ResizeObserver(() => {
            updateContainerWidth();
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [autoFitWidth]);

    // Calculate auto scale when container width or page width changes
    useEffect(() => {
        if (!autoFitWidth || !containerWidth) return;

        // Get the first page width as reference (assuming all pages have same width)
        const firstPageWidth = pageWidthsRef.current[1];
        if (firstPageWidth && firstPageWidth > 0) {
            // Calculate scale: container width / page width
            // Account for padding (20px on each side = 40px total)
            const availableWidth = containerWidth - 40;
            const scale = availableWidth / firstPageWidth;
            setAutoScale(scale);
        }
    }, [containerWidth, autoFitWidth, numPages]);

    // Notify parent of scale changes
    useEffect(() => {
        if (onScaleChange) {
            const currentScale = autoFitWidth ? autoScale : (zoom / 100);
            onScaleChange(currentScale);
        }
    }, [autoScale, zoom, autoFitWidth, onScaleChange]);

    // Scroll to focused component when requested
    useEffect(() => {
        if (!focusComponentId || !containerRef.current) return;
        const targetEl = containerRef.current.querySelector(`[data-component-id="${focusComponentId}"]`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }, [focusComponentId, numPages]);

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
        <div className={`pdf-viewer-container ${autoFitWidth ? 'auto-fit-width' : ''}`} ref={containerRef}>
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
                    Array.from({ length: numPages }, (_, i) => {
                        const pageNumber = i + 1;
                        // Lọc components thuộc trang này
                        const pageComponents = components.filter(comp => 
                            (comp.properties?.page || comp.page || 1) === pageNumber
                        );
                        
                        return (
                            <div key={i} data-page-index={i} ref={setPageRef(i)} style={{ position: 'relative', width: autoFitWidth ? '100%' : 'auto' }}>
                                <Page
                                    pageNumber={pageNumber}
                                    scale={autoFitWidth ? autoScale : (zoom / 100)}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    onLoadSuccess={(page) => {
                                        // Store page width for auto-fit calculation
                                        if (autoFitWidth) {
                                            const viewport = page.getViewport({ scale: 1 });
                                            pageWidthsRef.current[pageNumber] = viewport.width;
                                            // Trigger scale recalculation
                                            const firstPageWidth = pageWidthsRef.current[1];
                                            if (firstPageWidth && containerWidth > 0) {
                                                const availableWidth = containerWidth - 40;
                                                const scale = availableWidth / firstPageWidth;
                                                setAutoScale(scale);
                                            }
                                        }
                                    }}
                                    loading={
                                        <div className="pdf-loading">
                                            <div className="loading-spinner"></div>
                                            <p>Đang tải trang...</p>
                                        </div>
                                    }
                                />
                                {/* Render components trên trang này */}
                                {pageComponents.map(component => {
                                    const isLocked = Boolean(component.locked);
                                    const assignedName = component.assignedRecipientName;
                                    const assignedRole = component.assignedRecipientRole;
                                    const badgeLabel = assignedName
                                        ? `${assignedName}${assignedRole ? ` - ${assignedRole}` : ''}`
                                        : '';
                                    // Calculate current scale factor
                                    const currentScale = autoFitWidth ? autoScale : (zoom / 100);
                                    
                                    // Scale component coordinates and dimensions
                                    const scaledX = (component.properties?.x || 0) * currentScale;
                                    const scaledY = (component.properties?.y || 0) * currentScale;
                                    const scaledWidth = (component.properties?.width || 100) * currentScale;
                                    const scaledHeight = (component.properties?.height || 30) * currentScale;
                                    const scaledFontSize = (component.properties?.size || 12) * currentScale;
                                    
                                    return (
                                        <div
                                            key={component.id}
                                            data-component-id={component.id}
                                            data-component-type={component.type}
                                            className={`document-component ${editingComponentId === component.id ? 'editing' : ''} ${isDragging && draggedComponent?.id === component.id ? 'dragging' : ''} ${isLocked ? 'locked' : ''} ${component.highlight ? `highlight-${component.highlightType}` : ''}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${scaledX}px`,
                                                top: `${scaledY}px`,
                                                width: `${scaledWidth}px`,
                                                height: `${scaledHeight}px`,
                                                fontSize: `${scaledFontSize}px`,
                                                fontFamily: component.properties?.font || 'Times New Roman',
                                                cursor: isLocked 
                                                    ? 'not-allowed' 
                                                    : (component.type === 'text' && onTextFieldChange && !isLocked) 
                                                        ? 'text'  // Text cursor chỉ khi có inline editing (màn sign)
                                                        : (isDragging ? 'grabbing' : 'grab'), // Grab cursor cho DocumentEditor
                                                zIndex: editingComponentId === component.id ? 100 : 10
                                            }}
                                        onMouseEnter={() => onComponentMouseEnter && onComponentMouseEnter(component.id)}
                                        onMouseLeave={() => onComponentMouseLeave && onComponentMouseLeave()}
                                        onMouseDown={(e) => {
                                            // Chỉ block drag khi đang inline editing (có onTextFieldChange)
                                            const isInlineEditing = editingComponentId === component.id && onTextFieldChange;
                                            if (!isLocked && onComponentMouseDown && !isInlineEditing) {
                                                onComponentMouseDown(e, component.id);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (!isDragging && !isLocked && onComponentClick) {
                                                onComponentClick(component);
                                            }
                                        }}
                                    >
                                        {badgeLabel && (
                                            <div className="component-assignee-badge">
                                                {badgeLabel}
                                            </div>
                                        )}
                                        <div className="component-content" style={{ color: '#000' }}>
                                            {component.type === 'text' && editingComponentId === component.id && onTextFieldChange ? (
                                                // Inline editing mode (chỉ khi có onTextFieldChange - màn sign)
                                                <input
                                                    type="text"
                                                    className="component-inline-input"
                                                    value={component.properties?.fieldName || ''}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (onTextFieldChange) {
                                                            onTextFieldChange(component.id, e.target.value);
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        e.stopPropagation();
                                                        if (onTextFieldBlur) {
                                                            onTextFieldBlur();
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                                            e.target.blur();
                                                        }
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    placeholder={component.properties?.label || 'Nhập nội dung'}
                                                    autoFocus
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: '2px solid #4CAF50',
                                                        padding: '4px',
                                                        fontSize: 'inherit',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        background: 'white'
                                                    }}
                                                />
                                            ) : (
                                                // Display mode
                                                component.type === 'text' ? (
                                                    component.properties?.fieldName 
                                                        ? component.properties.fieldName
                                                        : <span style={{ color: '#999', fontStyle: 'italic' }}>
                                                            {component.properties?.label || (onTextFieldChange ? 'Nhấp để điền' : `[${component.name}]`)}
                                                          </span>
                                                ) : component.signatureType 
                                                    ? `[${component.name}]`
                                                    : `[${component.name}]`
                                            )}
                                        </div>
                                        
                                        {showLockedBadge && isLocked && (component.recipient?.name || component.name) && (
                                            <div
                                                className="locked-badge"
                                                style={{
                                                    color: '#1f1f1f',
                                                    background: 'rgba(255,255,255,0.8)',
                                                    border: '1px solid rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {component.recipient?.name || component.name}
                                            </div>
                                        )}
                                        
                                        {/* Resize handles */}
                                        {!isLocked && (
                                            <>
                                                <div className="resize-handle nw" onMouseDown={(e) => onResizeStart && onResizeStart(e, component.id, 'nw')}></div>
                                                <div className="resize-handle ne" onMouseDown={(e) => onResizeStart && onResizeStart(e, component.id, 'ne')}></div>
                                                <div className="resize-handle sw" onMouseDown={(e) => onResizeStart && onResizeStart(e, component.id, 'sw')}></div>
                                                <div className="resize-handle se" onMouseDown={(e) => onResizeStart && onResizeStart(e, component.id, 'se')}></div>
                                            </>
                                        )}
                                        
                                        {hoveredComponentId === component.id && !isLocked && (
                                            <button 
                                                className="remove-component-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveComponent && onRemoveComponent(component.id);
                                                }}
                                                title="Xóa component"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </Document>
        </div>
    );
}

export default PDFViewer;
