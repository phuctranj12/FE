import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../../styles/documentEditor.css';
import customerService from '../../api/customerService';
import contractService from '../../api/contractService';
import PDFViewer from '../document/PDFViewer';

function DocumentEditor({
    documentType = 'single-template',
    contractId,
    documentId,
    participantsData = [],
    fieldsData = [],
    onFieldsChange,
    totalPages: initialTotalPages = 1,
    onBack,
    onNext,
    onSaveDraft,
    hideFooter = false,
    lockedFieldIds = [],
    onAssignmentStateChange = null,
    showLockedBadge = true,
    // Khi true: sử dụng API template-documents để lấy presigned URL
    isTemplateDocument = false,
    // Nếu truyền vào, ưu tiên hiển thị PDF này (dùng cho template)
    templatePdfUrl = null
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [documentComponents, setDocumentComponents] = useState([]);
    const [showSignatureDropdown, setShowSignatureDropdown] = useState(false);
    const [hoveredComponentId, setHoveredComponentId] = useState(null);
    const [editingComponentId, setEditingComponentId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [nextWarning, setNextWarning] = useState('');
    const [currentScale, setCurrentScale] = useState(1); // Track PDF scale for coordinate normalization

    // State cho autocomplete gợi ý tên
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [recipientSearchValue, setRecipientSearchValue] = useState('');
    const suggestionTimeoutRef = useRef(null);

    // Ref cho PDF viewer container để scroll
    const pdfViewerContainerRef = useRef(null);

    // Ref để track xem đã load fieldsData lần đầu chưa
    const hasLoadedFieldsRef = useRef(false);

    // Hàm tính default size dựa trên PDF page width
    const getDefaultComponentSize = () => {
        const pdfContainer = pdfViewerContainerRef.current;
        if (!pdfContainer) {
            // Fallback nếu chưa có container
            return { width: 200, height: 80 };
        }

        const safePageIndex = Math.max(0, (currentPage || 1) - 1);
        const pageSelector = `[data-page-index="${safePageIndex}"]`;
        const pageElement = pdfContainer.querySelector(pageSelector);
        const targetElement = pageElement?.querySelector('canvas, .page, .react-pdf__Page') || pageElement;
        const pageWidth = targetElement?.clientWidth;

        if (!pageWidth || pageWidth === 0) {
            // Fallback nếu chưa load page
            return { width: 200, height: 80 };
        }

        // Component width = 25% của page width (có thể điều chỉnh tỷ lệ này)
        // Component height = 10% của page width (giữ tỷ lệ hợp lý)
        const width = Math.round(pageWidth * 0.25);
        const height = Math.round(pageWidth * 0.10);

        return {
            width: Math.max(width, 50),   // Tối thiểu 50px
            height: Math.max(height, 20)  // Tối thiểu 20px
        };
    };

    const createCenteredProperties = (overrides = {}) => {
        const minWidth = 50;
        const minHeight = 20;
        const defaultSize = getDefaultComponentSize();
        const width = Math.max(overrides.width ?? defaultSize.width, minWidth);
        const height = Math.max(overrides.height ?? defaultSize.height, minHeight);
        const { x, y } = getCenteredPosition(width, height);

        return {
            signer: '',
            recipientId: null,
            font: 'Times New Roman',
            size: 13,
            x,
            y,
            width,
            height,
            page: currentPage,
            ...overrides
        };
    };

    const getCenteredPosition = (width, height) => {
        // Nếu không truyền width/height, lấy default size
        if (!width || !height) {
            const defaultSize = getDefaultComponentSize();
            width = width || defaultSize.width;
            height = height || defaultSize.height;
        }

        const fallbackCenter = {
            x: Math.max(0, (800 - width) / 2),
            y: Math.max(0, (600 - height) / 2)
        };

        const pdfContainer = pdfViewerContainerRef.current;
        if (!pdfContainer) {
            return fallbackCenter;
        }

        const safePageIndex = Math.max(0, (currentPage || 1) - 1);
        const pageSelector = `[data-page-index="${safePageIndex}"]`;
        const globalDocument = typeof document !== 'undefined' ? document : null;
        const pageElement = pdfContainer.querySelector(pageSelector) || globalDocument?.querySelector(pageSelector);
        const targetElement = pageElement?.querySelector('canvas, .page, .react-pdf__Page') || pageElement;

        const targetWidth = targetElement?.clientWidth;
        const targetHeight = targetElement?.clientHeight;

        if (!targetElement || !targetWidth || !targetHeight) {
            return fallbackCenter;
        }

        const pdfRect = pdfContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollLeft = pdfContainer.scrollLeft || 0;
        const scrollTop = pdfContainer.scrollTop || 0;

        const pageOffsetLeft = (targetRect.left - pdfRect.left) + scrollLeft;
        const pageOffsetTop = (targetRect.top - pdfRect.top) + scrollTop;

        const viewportCenterLeft = scrollLeft + (pdfContainer.clientWidth / 2);
        const viewportCenterTop = scrollTop + (pdfContainer.clientHeight / 2);

        const relativeCenterX = viewportCenterLeft - pageOffsetLeft - (width / 2);
        const relativeCenterY = viewportCenterTop - pageOffsetTop - (height / 2);

        return {
            x: Math.max(0, Math.min(targetWidth - width, relativeCenterX)),
            y: Math.max(0, Math.min(targetHeight - height, relativeCenterY))
        };
    };

    // Map component types sang field types theo CreateContractFlow.md
    const getFieldType = (componentId) => {
        const typeMap = {
            'text': 1,             // TEXT
            'image-signature': 2,  // IMAGE_SIGN
            'digital-signature': 3 // DIGITAL_SIGN
        };
        return typeMap[componentId] || 1;
    };

    // Lấy danh sách recipients từ participantsData
    const getRecipientsList = () => {
        const recipients = [];
        if (participantsData && participantsData.length > 0) {
            participantsData.forEach(participant => {
                if (participant.recipients && participant.recipients.length > 0) {
                    participant.recipients.forEach(recipient => {
                        recipients.push({
                            id: recipient.id,
                            name: recipient.name,
                            email: recipient.email,
                            role: recipient.role,
                            roleName: recipient.role === 2 ? 'Xem xét' :
                                recipient.role === 3 ? 'Ký' :
                                    recipient.role === 4 ? 'Văn thư' : 'Điều phối'
                        });
                    });
                }
            });
        }
        return recipients;
    };

    const recipientsList = useMemo(() => getRecipientsList(), [participantsData]);
    const SIGNER_ALLOWED_ROLES = [3, 4];
    const signerRecipients = recipientsList.filter(recipient => SIGNER_ALLOWED_ROLES.includes(recipient.role));
    const getActiveRecipientList = (componentId = selectedComponent?.id) => {
        // Signature components và text components chỉ được assign cho người ký (role 3) và văn thư (role 4)
        if (componentId === 'digital-signature' ||
            componentId === 'image-signature' ||
            componentId === 'text' ||
            selectedComponent?.type === 'text') {
            return signerRecipients;
        }
        return recipientsList;
    };

    // Dữ liệu mẫu cho các thành phần có thể kéo thả
    const availableComponents = [
        {
            id: 'text',
            name: 'TEXT',
            icon: 'T',
            type: 'field',
            autoCreate: true // Tự động tạo khi click
        },
        {
            id: 'digital-signature',
            name: 'CHỮ KÝ SỐ',
            icon: '∞',
            type: 'signature',
            hasDropdown: true
        }
    ];

    const unassignedComponents = useMemo(() => {
        return documentComponents.filter(component => {
            if (component.locked) return false;
            const recipientId = component.properties?.recipientId || parseInt(component.properties?.signer, 10);
            return !recipientId || Number.isNaN(recipientId);
        });
    }, [documentComponents]);

    const hasUnassignedComponents = unassignedComponents.length > 0;

    useEffect(() => {
        if (typeof onAssignmentStateChange === 'function') {
            onAssignmentStateChange(unassignedComponents.length);
        }
    }, [unassignedComponents.length, onAssignmentStateChange]);

    // Các tùy chọn chữ ký số
    const signatureOptions = [
        {
            id: 'signature-with-seal-info',
            name: 'Chữ ký có con dấu và thông tin',
            icon: 'seal-info',
            description: 'Con dấu/ chữ ký + Thông tin chữ ký số'
        },
        {
            id: 'signature-seal-only',
            name: 'Chỉ có con dấu/ chữ ký',
            icon: 'seal-only',
            description: 'Con dấu/ chữ ký'
        },
        {
            id: 'signature-info-only',
            name: 'Chỉ có thông tin',
            icon: 'info-only',
            description: 'Thông tin chữ ký số'
        }
    ];

    // Thuộc tính của component được chọn
    const [componentProperties, setComponentProperties] = useState({
        signer: '',
        font: 'Times New Roman',
        size: 11,
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const handlePageChange = (page) => {
        if (page && page >= 1) {
            console.log(`[Page Change] Trang hiện tại: ${page} / Tổng số trang: ${totalPages}`);
            setCurrentPage(page);
        }
    };

    // Handle scale change from PDFViewer
    const handleScaleChange = (scale) => {
        console.log(`[Scale Change] Current scale: ${scale}`);
        setCurrentScale(scale);
    };

    // Handle page change from PDFViewer (sync với pagination controls)
    // const handlePDFPageChange = (page) => {
    //     setCurrentPage(page);
    // };

    const handleComponentSelect = (component) => {
        // Nếu component có autoCreate (Text), tự động tạo component ở giữa màn hình
        if (component.autoCreate) {
            // Tính toán vị trí giữa màn hình (giả sử PDF viewer có width ~800px, height ~600px)
            // Vị trí giữa: x = 400 - width/2, y = 300 - height/2
            const ordering = documentComponents.length + 1;
            const centeredProperties = createCenteredProperties();

            const newComponent = {
                id: Date.now(),
                type: component.id,
                name: component.name,
                page: currentPage,
                properties: {
                    ...centeredProperties,
                    ordering: ordering,
                    fieldName: ''
                }
            };

            setDocumentComponents(prev => [...prev, newComponent]);
            setSelectedComponent(component);
            setEditingComponentId(newComponent.id);
            setComponentProperties(centeredProperties);
            setRecipientSearchValue('');
            setNameSuggestions([]);
        } else {
            // Các component khác (như Chữ ký số) vẫn giữ logic cũ
            setSelectedComponent(component);
            setEditingComponentId(null);
            setRecipientSearchValue('');
            setNameSuggestions([]);
            setComponentProperties(createCenteredProperties());
        }
    };

    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
        if (showSignatureDropdown && !event.target.closest('.component-wrapper')) {
            setShowSignatureDropdown(false);
        }
    };

    // Fetch name suggestions with debounce
    const fetchSuggestions = async (textSearch) => {
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        if (!textSearch || textSearch.trim().length < 2) {
            setNameSuggestions([]);
            return;
        }

        suggestionTimeoutRef.current = setTimeout(async () => {
            setSuggestionLoading(true);
            try {
                const response = await customerService.suggestListCustomer(textSearch.trim());
                if (response.code === 'SUCCESS' && response.data) {
                    const suggestions = response.data.map(item => item.name || '').filter(Boolean);
                    setNameSuggestions(suggestions);
                } else {
                    setNameSuggestions([]);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setNameSuggestions([]);
            } finally {
                setSuggestionLoading(false);
            }
        }, 300); // 300ms debounce
    };

    // Get recipient name by ID
    const getRecipientNameById = (recipientId) => {
        if (!recipientId) return '';
        const recipient = recipientsList.find(r => r.id === parseInt(recipientId));
        return recipient ? recipient.name : '';
    };

    // Handle recipient search change
    const handleRecipientSearchChange = (value) => {
        setRecipientSearchValue(value);
        fetchSuggestions(value);

        const targetList = getActiveRecipientList();

        // Tìm recipient trong danh sách phù hợp theo tên
        const foundRecipient = targetList.find(recipient =>
            recipient.name.toLowerCase().includes(value.toLowerCase())
        );

        if (foundRecipient) {
            handlePropertyChange('signer', foundRecipient.id.toString());
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestionName) => {
        setRecipientSearchValue(suggestionName);
        setNameSuggestions([]);

        const targetList = getActiveRecipientList();

        // Tìm recipient trong danh sách phù hợp theo tên chính xác
        const foundRecipient = targetList.find(recipient =>
            recipient.name === suggestionName
        );

        if (foundRecipient) {
            handlePropertyChange('signer', foundRecipient.id.toString());
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }
        };
    }, []);

    // Add event listener for click outside
    useEffect(() => {
        if (showSignatureDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showSignatureDropdown]);

    // Update totalPages khi initialTotalPages thay đổi
    useEffect(() => {
        if (initialTotalPages && initialTotalPages > 0) {
            setTotalPages(initialTotalPages);
        }
    }, [initialTotalPages]);

    // Ưu tiên dùng templatePdfUrl nếu có (tránh gọi presigned khi đã có URL)
    useEffect(() => {
        if (templatePdfUrl) {
            setPdfUrl(templatePdfUrl);
            setPdfError(null);
            setPdfLoading(false);
        }
    }, [templatePdfUrl]);

    // Log khi currentPage thay đổi (bắt cả scroll và click)
    useEffect(() => {
        console.log(`[Page Update] Trang hiện tại: ${currentPage} / Tổng số trang: ${totalPages}`);
    }, [currentPage, totalPages]);

    // Load presigned URL khi documentId có
    useEffect(() => {
        const loadPresignedUrl = async () => {
            if (!pdfUrl) {
                // Test URL - có thể xóa sau khi test xong
                const testUrl = 'http://127.0.0.1:9000/contracts/1762524046600_CV_NguyenThaiMinh%20%281%29.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20251107%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251107T164659Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0d9fc7c599bcd075819ace8caf2fdf9fe9b31eaa0c321c2e308c22a625527e20';

                if (documentId) {
                    try {
                        setPdfLoading(true);
                        setPdfError(null);
                        const response = isTemplateDocument
                            ? await contractService.getTemplateDocumentPresignedUrl(documentId)
                            : await contractService.getPresignedUrl(documentId);

                        console.log('[DocumentEditor] getPresignedUrl response:', response);

                        // Kiểm tra response format
                        if (response && response.code === 'SUCCESS') {
                            // URL có thể ở nhiều vị trí:
                            // 1. response.data là string URL trực tiếp
                            // 2. response.data.url
                            // 3. response.data.message (theo response thực tế)
                            // 4. response.url
                            const url = typeof response.data === 'string'
                                ? response.data
                                : (response.data?.url || response.data?.message || response.url);

                            if (url) {
                                setPdfUrl(url);
                                setPdfError(null);
                                console.log('[DocumentEditor] PDF URL loaded:', url);
                            } else {
                                console.error('[DocumentEditor] No URL in response:', response);
                                setPdfError('Không tìm thấy URL trong phản hồi từ server');
                            }
                        } else {
                            const errorMsg = response?.message || 'Không thể lấy URL tài liệu';
                            console.error('[DocumentEditor] API error:', errorMsg, response);
                            setPdfError(errorMsg);
                        }
                    } catch (err) {
                        console.error('[DocumentEditor] Error loading presigned URL:', err);
                        // Xử lý error từ axios
                        const errorMessage = err.response?.data?.message
                            || err.message
                            || 'Không thể tải tài liệu';
                        setPdfError(errorMessage);
                    } finally {
                        setPdfLoading(false);
                    }
                } else {
                    console.log('[DocumentEditor] Using test URL');
                    setPdfUrl(testUrl);
                    setPdfLoading(false);
                }
            }
        };

        loadPresignedUrl();
    }, [documentId, pdfUrl]);

    // Store normalized coordinates from database for re-scaling
    const normalizedFieldsRef = useRef([]);

    // Load fields data khi component mount hoặc fieldsData thay đổi
    // CHỈ load MỘT LẦN khi có fieldsData lần đầu
    useEffect(() => {
        // Chỉ load khi:
        // 1. Có fieldsData
        // 2. Chưa load lần nào (hasLoadedFieldsRef.current === false)
        // 3. Có currentScale
        // 4. fieldsData có length > 0
        const shouldLoad = fieldsData &&
            fieldsData.length > 0 &&
            !hasLoadedFieldsRef.current &&
            currentScale > 0;

        console.log('[DEBUG] useEffect fieldsData check:', {
            shouldLoad,
            fieldsDataLength: fieldsData?.length,
            hasLoadedFields: hasLoadedFieldsRef.current,
            componentsLength: documentComponents.length,
            currentScale
        });

        if (shouldLoad) {
            console.log('[DEBUG] Loading components from fieldsData (FIRST TIME)...');
            hasLoadedFieldsRef.current = true; // Đánh dấu đã load

            // Store normalized coordinates for later re-scaling
            normalizedFieldsRef.current = fieldsData.map(field => ({
                id: field.id,
                boxX: field.boxX || 0,
                boxY: field.boxY || 0,
                boxW: field.boxW || 100,
                boxH: field.boxH || 30
            }));

            // Convert fieldsData về documentComponents format
            // NOTE: Coordinates from DB are normalized (scale=1.0)
            // We scale them by currentScale for editing consistency
            const loadedComponents = fieldsData.map((field, index) => {
                // Map field type về component type
                let componentType = 'text';
                if (field.type === 2) componentType = 'image-signature';
                else if (field.type === 3) componentType = 'digital-signature';

                // Scale coordinates from normalized (scale=1.0) to currentScale
                const scaledX = (field.boxX || 0) * currentScale;
                const scaledY = (field.boxY || 0) * currentScale;
                const scaledW = (field.boxW || 100) * currentScale;
                const scaledH = (field.boxH || 30) * currentScale;

                const isLocked = lockedFieldIds?.includes(field.id);

                console.log('[DEBUG] Loading field:', {
                    fieldId: field.id,
                    fieldName: field.name,
                    isLocked,
                    lockedFieldIds,
                    hasFieldId: !!field.id
                });

                return {
                    id: field.id || Date.now() + index,
                    fieldId: field.id,
                    type: componentType,
                    name: field.name || 'Field',
                    page: parseInt(field.page) || 1,
                    properties: {
                        signer: field.recipientId?.toString() || '',
                        recipientId: field.recipientId,
                        font: field.font || 'Times New Roman',
                        size: field.fontSize || 11,
                        // Store coordinates at currentScale for editing consistency
                        x: scaledX,
                        y: scaledY,
                        width: scaledW,
                        height: scaledH,
                        fieldName: field.name || '',
                        ordering: field.ordering || index + 1
                    },
                    locked: Boolean(isLocked)
                };
            });
            console.log('[DEBUG] Loaded components:', loadedComponents);
            setDocumentComponents(loadedComponents);
        }
    }, [fieldsData, currentScale, lockedFieldIds]);

    // Re-scale components when currentScale changes (important for locked components from previous organizations)
    // This ensures components from previous organizations are displayed at correct scale
    useEffect(() => {
        // Only re-scale if we have normalized fields and existing components with fieldId
        if (normalizedFieldsRef.current.length > 0 && currentScale > 0) {
            setDocumentComponents(prev => {
                // Check if any component needs re-scaling
                const needsRescaling = prev.some(comp => {
                    if (!comp.fieldId) return false;
                    const normalizedField = normalizedFieldsRef.current.find(nf => nf.id === comp.fieldId);
                    if (!normalizedField) return false;
                    // Check if coordinates are already at correct scale
                    const expectedX = normalizedField.boxX * currentScale;
                    const expectedY = normalizedField.boxY * currentScale;
                    // Allow small floating point differences (0.1px tolerance)
                    return Math.abs(comp.properties.x - expectedX) > 0.1 ||
                        Math.abs(comp.properties.y - expectedY) > 0.1;
                });

                if (!needsRescaling) return prev;

                // Re-scale all components that came from database
                return prev.map(component => {
                    // Only re-scale components that came from database (have fieldId)
                    if (!component.fieldId) return component;

                    // Find normalized coordinates for this component
                    const normalizedField = normalizedFieldsRef.current.find(nf => nf.id === component.fieldId);
                    if (!normalizedField) return component;

                    // Re-scale from normalized coordinates
                    const scaledX = normalizedField.boxX * currentScale;
                    const scaledY = normalizedField.boxY * currentScale;
                    const scaledW = normalizedField.boxW * currentScale;
                    const scaledH = normalizedField.boxH * currentScale;

                    return {
                        ...component,
                        properties: {
                            ...component.properties,
                            x: scaledX,
                            y: scaledY,
                            width: scaledW,
                            height: scaledH
                        }
                    };
                });
            });
        }
    }, [currentScale]);

    useEffect(() => {
        if (!lockedFieldIds) return;
        setDocumentComponents(prev => prev.map(component => {
            if (!component.fieldId) return component;
            const shouldLock = lockedFieldIds.includes(component.fieldId);
            if (component.locked === shouldLock) {
                return component;
            }
            return { ...component, locked: shouldLock };
        }));
    }, [lockedFieldIds]);

    // Convert documentComponents sang fields format và gọi onFieldsChange
    useEffect(() => {
        if (onFieldsChange && contractId && documentId) {
            const fields = documentComponents
                .filter(component => {
                    // Bỏ qua các component bị khóa (thuộc đối tác trước đó)
                    if (component.locked) return false;
                    // Chỉ include components có recipientId hợp lệ
                    const recipientId = component.properties.recipientId || parseInt(component.properties.signer);
                    return recipientId && !isNaN(recipientId);
                })
                .map((component, index) => {
                    const fieldType = getFieldType(component.type);
                    const recipientId = component.properties.recipientId || parseInt(component.properties.signer);

                    // IMPORTANT: Trong editor mode, components KHÔNG được scale khi hiển thị
                    // (xem PDFViewer.js line 254: shouldScale = !isEditorMode)
                    // Do đó, tọa độ trong component.properties đã là tọa độ thực (scale=1.0)
                    // Chúng ta lưu trực tiếp mà KHÔNG cần normalize
                    // 
                    // Tuy nhiên, để đảm bảo tương thích với màn hình nhỏ (laptop),
                    // nếu currentScale < 1.0, chúng ta cần scale UP tọa độ để đảm bảo
                    // kích thước đúng trên tài liệu thực tế
                    const scaleAdjustment = currentScale > 0 && currentScale < 1.0 ? (1.0 / currentScale) : 1.0;
                    
                    const adjustedX = (component.properties.x || 0) * scaleAdjustment;
                    const adjustedY = (component.properties.y || 0) * scaleAdjustment;
                    const adjustedW = (component.properties.width || 100) * scaleAdjustment;
                    const adjustedH = (component.properties.height || 30) * scaleAdjustment;

                    return {
                        // Chỉ include id khi edit (có fieldId)
                        ...(component.fieldId && { id: component.fieldId }),
                        name: component.properties.fieldName || component.name,
                        font: component.properties.font || 'Times New Roman',
                        fontSize: component.properties.size || 11,
                        // Save adjusted coordinates (scale=1.0) to database
                        boxX: adjustedX,
                        boxY: adjustedY,
                        page: (component.properties.page || currentPage).toString(),
                        ordering: component.properties.ordering || index + 1,
                        boxW: adjustedW, // Có thể là number hoặc string
                        boxH: adjustedH.toString(), // API yêu cầu string cho boxH
                        contractId: contractId,
                        documentId: documentId,
                        type: fieldType,
                        recipientId: recipientId,
                        status: 0
                    };
                });

            if (fields.length > 0) {
                onFieldsChange(fields);
            }
        }
    }, [documentComponents, contractId, documentId, currentPage, currentScale, onFieldsChange]);

    // Add event listeners for drag and resize
    useEffect(() => {
        const handleMouseMoveEvent = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            } else if (isResizing) {
                handleResizeMove(e);
            }
        };

        const handleMouseUpEvent = () => {
            if (isDragging) {
                handleMouseUp();
            } else if (isResizing) {
                handleResizeEnd();
            }
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMoveEvent);
            document.addEventListener('mouseup', handleMouseUpEvent);

            return () => {
                document.removeEventListener('mousemove', handleMouseMoveEvent);
                document.removeEventListener('mouseup', handleMouseUpEvent);
            };
        }
    }, [isDragging, isResizing]);

    const handlePropertyChange = (property, value) => {
        const newProperties = {
            ...componentProperties,
            [property]: value
        };

        // Nếu thay đổi signer, tự động set recipientId
        if (property === 'signer' && value) {
            const recipientId = parseInt(value);
            if (!isNaN(recipientId)) {
                newProperties.recipientId = recipientId;
            }
        }

        setComponentProperties(newProperties);

        // Tự động cập nhật component trong documentComponents khi đang edit
        if (editingComponentId) {
            const editingComponent = documentComponents.find(comp => comp.id === editingComponentId);
            if (editingComponent && !editingComponent.locked) {
                setDocumentComponents(prev => prev.map(comp =>
                    comp.id === editingComponentId
                        ? {
                            ...comp,
                            properties: {
                                ...comp.properties,
                                ...newProperties,
                                page: currentPage // Đảm bảo page được cập nhật
                            }
                        }
                        : comp
                ));
            }
        }
    };

    const handleAddComponent = () => {
        if (selectedComponent && componentProperties.signer) {
            // Đảm bảo kích thước tối thiểu
            const width = Math.max(componentProperties.width || 100, 50);
            const height = Math.max(componentProperties.height || 30, 20);

            const recipientId = parseInt(componentProperties.signer);
            const ordering = documentComponents.length + 1;

            const newComponent = {
                id: Date.now(),
                type: selectedComponent.id,
                name: selectedComponent.name,
                page: currentPage,
                locked: false,
                properties: {
                    ...componentProperties,
                    recipientId: recipientId,
                    width: width,
                    height: height,
                    page: currentPage,
                    ordering: ordering
                }
            };
            setDocumentComponents(prev => [...prev, newComponent]);
        }
    };

    const handleRemoveComponent = (componentId) => {
        const target = documentComponents.find(comp => comp.id === componentId);
        console.log('[DEBUG] Remove component:', {
            componentId,
            target,
            locked: target?.locked,
            lockedFieldIds,
            currentFieldsDataLength: fieldsData?.length,
            currentComponentsLength: documentComponents.length
        });
        if (target?.locked) {
            console.log('[DEBUG] Component is locked, cannot remove');
            return;
        }
        setDocumentComponents(prev => {
            const newComponents = prev.filter(comp => comp.id !== componentId);
            console.log('[DEBUG] After remove, components length:', newComponents.length);
            return newComponents;
        });
    };

    const handleComponentClick = (component) => {
        if (component.locked) {
            return;
        }
        setEditingComponentId(component.id);
        setComponentProperties(component.properties);
        // Set recipient search value khi click vào component
        const recipientName = getRecipientNameById(component.properties.signer || component.properties.recipientId);
        setRecipientSearchValue(recipientName);
        const foundComponent = availableComponents.find(comp => comp.id === component.type);
        setSelectedComponent({
            id: component.type,
            name: component.name,
            icon: foundComponent?.icon || '📄',
            autoCreate: foundComponent?.autoCreate || false
        });

        // Scroll đến component ở giữa màn hình
        scrollToComponent(component);
    };

    // Hàm scroll đến component ở giữa màn hình
    const scrollToComponent = (component) => {
        // Đợi một chút để đảm bảo component đã được render
        setTimeout(() => {
            const componentPage = component.properties?.page || component.page || currentPage;

            // Chuyển đến trang chứa component nếu cần
            if (componentPage !== currentPage) {
                setCurrentPage(componentPage);
                // Đợi trang load xong rồi mới scroll
                setTimeout(() => {
                    performScroll(component, componentPage);
                }, 500);
            } else {
                performScroll(component, componentPage);
            }
        }, 150);
    };

    const performScroll = (component, pageNumber) => {
        // Tìm component element bằng data-component-id
        const componentElement = document.querySelector(`[data-component-id="${component.id}"]`);
        if (!componentElement) {
            // Retry sau một chút nếu chưa tìm thấy
            setTimeout(() => performScroll(component, pageNumber), 200);
            return;
        }

        // Lấy PDF viewer container - thử nhiều selector
        const pdfContainer = pdfViewerContainerRef.current?.querySelector('.pdf-viewer-container') ||
            pdfViewerContainerRef.current ||
            document.querySelector('.pdf-viewer-container') ||
            document.querySelector('.pdf-viewer-inner') ||
            document.querySelector('.pdf-viewer');

        if (!pdfContainer) {
            console.warn('PDF container not found for scrolling');
            return;
        }

        // Lấy vị trí của component element
        const componentRect = componentElement.getBoundingClientRect();
        const containerRect = pdfContainer.getBoundingClientRect();

        // Tính toán vị trí scroll để component ở giữa viewport
        const componentTopRelativeToContainer = componentRect.top - containerRect.top + pdfContainer.scrollTop;
        const containerHeight = containerRect.height;
        const componentHeight = componentRect.height;

        // Scroll để component ở giữa màn hình
        const targetScrollTop = componentTopRelativeToContainer - (containerHeight / 2) + (componentHeight / 2);

        // Scroll với smooth animation
        pdfContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
        });
    };


    const handleSignatureOptionClick = (option) => {
        console.log('handleSignatureOptionClick', option);
        if (selectedComponent) {
            const defaultSize = getDefaultComponentSize();
            const width = Math.max(componentProperties.width || defaultSize.width, 50);
            const height = Math.max(componentProperties.height || defaultSize.height, 20);
            const { x, y } = getCenteredPosition(width, height);

            const newComponent = {
                id: Date.now(),
                type: selectedComponent.id,
                name: `${selectedComponent.name} - ${option.name}`,
                signatureType: option.id,
                locked: false,
                properties: {
                    ...componentProperties,
                    width,
                    height,
                    x,
                    y,
                    page: currentPage,
                    ordering: documentComponents.length + 1
                }
            };
            setDocumentComponents(prev => [...prev, newComponent]);
            setShowSignatureDropdown(false);
        }
    };

    // Drag and Drop handlers
    const handleMouseDown = (e, componentId) => {
        e.preventDefault();
        e.stopPropagation();

        const component = documentComponents.find(comp => comp.id === componentId);
        if (!component || component.locked) return;

        // Tìm page container (parent có data-page-index)
        let pageContainer = e.target.closest('[data-page-index]');
        if (!pageContainer) {
            // Fallback: tìm trong document
            pageContainer = document.querySelector(`[data-page-index="${(component.properties?.page || component.page || 1) - 1}"]`);
        }

        const pageRect = pageContainer ? pageContainer.getBoundingClientRect() : null;
        const componentRect = e.currentTarget.getBoundingClientRect();

        setDraggedComponent(component);
        setIsDragging(true);

        if (pageRect) {
            // Lưu offset từ mouse đến component (relative với page container)
            const offsetX = e.clientX - componentRect.left;
            const offsetY = e.clientY - componentRect.top;
            setDragStart({
                offsetX: offsetX,
                offsetY: offsetY,
                initialX: component.properties.x,
                initialY: component.properties.y,
                pageRectLeft: pageRect.left,
                pageRectTop: pageRect.top
            });
        } else {
            // Fallback: dùng logic cũ
            setDragStart({
                offsetX: e.clientX - component.properties.x,
                offsetY: e.clientY - component.properties.y,
                initialX: component.properties.x,
                initialY: component.properties.y,
                pageRectLeft: 0,
                pageRectTop: 0
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !draggedComponent) return;

        // Tìm page container hiện tại (cập nhật mỗi lần move để handle scroll)
        const pageNumber = draggedComponent.properties?.page || draggedComponent.page || currentPage;
        const pageContainer = document.querySelector(`[data-page-index="${pageNumber - 1}"]`);

        if (pageContainer) {
            const pageRect = pageContainer.getBoundingClientRect();
            // Tính toán tọa độ mới relative với page container
            // newX = (mouse position - page position) - offset từ mouse đến component
            const newX = (e.clientX - pageRect.left) - dragStart.offsetX;
            const newY = (e.clientY - pageRect.top) - dragStart.offsetY;

            setDocumentComponents(prev => prev.map(comp => {
                if (comp.id === draggedComponent.id) {
                    const updatedProperties = {
                        ...comp.properties,
                        x: Math.max(0, newX),
                        y: Math.max(0, newY),
                        page: pageNumber
                    };

                    // Cập nhật componentProperties để sidebar hiển thị giá trị mới ngay lập tức
                    if (editingComponentId === draggedComponent.id) {
                        setComponentProperties(updatedProperties);
                    }

                    return { ...comp, properties: updatedProperties };
                }
                return comp;
            }));
        } else {
            // Fallback: dùng logic cũ
            const newX = e.clientX - dragStart.offsetX;
            const newY = e.clientY - dragStart.offsetY;

            setDocumentComponents(prev => prev.map(comp => {
                if (comp.id === draggedComponent.id) {
                    const updatedProperties = {
                        ...comp.properties,
                        x: Math.max(0, newX),
                        y: Math.max(0, newY),
                        page: currentPage
                    };

                    // Cập nhật componentProperties để sidebar hiển thị giá trị mới ngay lập tức
                    if (editingComponentId === draggedComponent.id) {
                        setComponentProperties(updatedProperties);
                    }

                    return { ...comp, properties: updatedProperties };
                }
                return comp;
            }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedComponent(null);
    };

    useEffect(() => {
        if (!hasUnassignedComponents && nextWarning) {
            setNextWarning('');
        }
    }, [hasUnassignedComponents, nextWarning]);

    const handleNextClick = () => {
        if (hasUnassignedComponents) {
            setNextWarning(`Vui lòng gán người xử lý cho ${unassignedComponents.length} thành phần trước khi tiếp tục.`);
            return;
        }
        setNextWarning('');
        if (onNext) {
            onNext();
        }
    };

    // Resize handlers
    const handleResizeStart = (e, componentId, handle) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Resize start:', { componentId, handle, clientX: e.clientX, clientY: e.clientY });

        const component = documentComponents.find(comp => comp.id === componentId);
        if (!component || component.locked) return;

        setIsResizing(true);
        setResizeHandle(handle);
        setDraggedComponent(component);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleResizeMove = (e) => {
        if (!isResizing || !draggedComponent || !resizeHandle) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        console.log('Resize move:', {
            deltaX,
            deltaY,
            resizeHandle,
            clientX: e.clientX,
            clientY: e.clientY,
            dragStart
        });

        // Get current component from state to ensure we have latest values
        const currentComponent = documentComponents.find(comp => comp.id === draggedComponent.id);
        if (!currentComponent) return;

        let newWidth = currentComponent.properties.width;
        let newHeight = currentComponent.properties.height;

        switch (resizeHandle) {
            case 'se':
                newWidth = Math.max(50, currentComponent.properties.width + deltaX);
                newHeight = Math.max(20, currentComponent.properties.height + deltaY);
                break;
            case 'sw':
                newWidth = Math.max(50, currentComponent.properties.width - deltaX);
                newHeight = Math.max(20, currentComponent.properties.height + deltaY);
                break;
            case 'ne':
                newWidth = Math.max(50, currentComponent.properties.width + deltaX);
                newHeight = Math.max(20, currentComponent.properties.height - deltaY);
                break;
            case 'nw':
                newWidth = Math.max(50, currentComponent.properties.width - deltaX);
                newHeight = Math.max(20, currentComponent.properties.height - deltaY);
                break;
        }

        console.log('New size:', { newWidth, newHeight });

        const updatedProperties = { ...currentComponent.properties, width: newWidth, height: newHeight };

        setDocumentComponents(prev => prev.map(comp =>
            comp.id === draggedComponent.id
                ? { ...comp, properties: updatedProperties }
                : comp
        ));

        // Cập nhật componentProperties để sidebar hiển thị giá trị mới ngay lập tức
        if (editingComponentId === draggedComponent.id) {
            setComponentProperties(updatedProperties);
        }

        // Update dragStart for next calculation
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        setResizeHandle(null);
        setDraggedComponent(null);
    };

    return (
        <div className="document-editor-container">
            <div className="editor-wrapper">
                {/* Header với radio buttons và pagination */}
                <div className="editor-header">
                    <div className="document-type-selection">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-no-template"
                                checked={documentType === 'single-no-template'}
                                readOnly
                            />
                            Tài liệu đơn lẻ không theo mẫu
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="documentType"
                                value="single-template"
                                checked={documentType === 'single-template'}
                                readOnly
                            />
                            Tài liệu đơn lẻ theo mẫu
                        </label>
                    </div>

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
                </div>

                <div className="editor-content">
                    {/* Left Sidebar - Components */}
                    <div className="components-sidebar">
                        <h3 className="sidebar-title">THÀNH PHẦN</h3>
                        <p className="sidebar-instruction">
                            Kéo thả các trường thông tin dưới đây để thêm ô nhập hoặc ô ký vào tài liệu
                        </p>

                        <div className="components-list">
                            {availableComponents.map(component => (
                                <div key={component.id} className="component-wrapper">
                                    <button
                                        className={`component-item ${selectedComponent?.id === component.id ? 'selected' : ''}`}
                                        onClick={(e) => {
                                            if (component.hasDropdown) {
                                                e.stopPropagation();
                                                setSelectedComponent(component);
                                                setComponentProperties(createCenteredProperties());
                                                const rect = e.target.getBoundingClientRect();
                                                setDropdownPosition({
                                                    top: rect.top,
                                                    left: rect.right + 8
                                                });
                                                setShowSignatureDropdown(!showSignatureDropdown);
                                            } else {
                                                handleComponentSelect(component);
                                            }
                                        }}
                                    >
                                        <span className="component-icon">{component.icon}</span>
                                        <span className="component-name">{component.name}</span>
                                        {component.hasDropdown && <span className="dropdown-arrow">›</span>}
                                    </button>

                                    {/* Dropdown cho chữ ký số */}
                                    {component.hasDropdown && showSignatureDropdown && (
                                        <div
                                            className="signature-dropdown"
                                            style={{
                                                top: `${dropdownPosition.top}px`,
                                                left: `${dropdownPosition.left}px`
                                            }}
                                        >
                                            {signatureOptions.map(option => (
                                                <div
                                                    key={option.id}
                                                    className="signature-option"
                                                    onClick={() => handleSignatureOptionClick(option)}
                                                >
                                                    <div className="signature-preview">
                                                        {option.icon === 'seal-info' && (
                                                            <div className="preview-boxes">
                                                                <div className="preview-box">
                                                                    <div className="preview-icon">✍️</div>
                                                                    <div className="preview-text">Con dấu/ chữ ký</div>
                                                                </div>
                                                                <div className="preview-box">
                                                                    <div className="preview-icon">📋</div>
                                                                    <div className="preview-text">Thông tin chữ ký số</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {option.icon === 'seal-only' && (
                                                            <div className="preview-boxes">
                                                                <div className="preview-box">
                                                                    <div className="preview-icon">✍️</div>
                                                                    <div className="preview-text">Con dấu/ chữ ký</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {option.icon === 'info-only' && (
                                                            <div className="preview-boxes">
                                                                <div className="preview-box">
                                                                    <div className="preview-icon">📋</div>
                                                                    <div className="preview-text">Thông tin chữ ký số</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="signature-label">{option.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content - Document */}
                    <div className="document-content">
                        <div className="document-page" style={{ position: 'relative' }}>
                            {pdfLoading && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    minHeight: '600px'
                                }}>
                                    <div>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                        <p>Đang tải tài liệu...</p>
                                    </div>
                                </div>
                            )}

                            {pdfError && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    minHeight: '600px',
                                    color: '#dc3545'
                                }}>
                                    <div>
                                        <p>Không thể tải tài liệu</p>
                                        <p style={{ fontSize: '14px', marginTop: '8px' }}>{pdfError}</p>
                                    </div>
                                </div>
                            )}

                            {pdfUrl && !pdfLoading && !pdfError && (
                                <div className="pdf-viewer" ref={pdfViewerContainerRef}>
                                    <PDFViewer
                                        document={{ pdfUrl: pdfUrl }}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        zoom={zoom}
                                        onPageChange={handlePageChange}
                                        onScaleChange={handleScaleChange}
                                        components={documentComponents.map(component => {
                                            const recipientId = component.properties?.recipientId || parseInt(component.properties?.signer, 10);
                                            const recipientInfo = recipientsList.find(r => r.id === recipientId);
                                            return {
                                                ...component,
                                                assignedRecipientName: recipientInfo?.name || '',
                                                assignedRecipientRole: recipientInfo?.roleName || ''
                                            };
                                        })}
                                        editingComponentId={editingComponentId}
                                        hoveredComponentId={hoveredComponentId}
                                        isDragging={isDragging}
                                        draggedComponent={draggedComponent}
                                        onComponentClick={handleComponentClick}
                                        onComponentMouseDown={handleMouseDown}
                                        onComponentMouseEnter={(id) => {
                                            console.log('[DEBUG] Mouse enter component:', id);
                                            setHoveredComponentId(id);
                                        }}
                                        onComponentMouseLeave={() => {
                                            console.log('[DEBUG] Mouse leave component');
                                            setHoveredComponentId(null);
                                        }}
                                        onResizeStart={handleResizeStart}
                                        onRemoveComponent={handleRemoveComponent}
                                        autoFitWidth={true}
                                        showLockedBadge={showLockedBadge}
                                    />
                                </div>
                            )}

                            {!pdfUrl && !pdfLoading && !pdfError && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    minHeight: '600px',
                                    color: '#666'
                                }}>
                                    <p>Chưa có tài liệu để hiển thị</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Properties */}
                    <div className="properties-sidebar">
                        <h3 className="sidebar-title">THUỘC TÍNH</h3>

                        {selectedComponent ? (
                            <div className="properties-form">
                                {/* Properties cho TEXT */}
                                {selectedComponent.id === 'text' && (
                                    <>
                                        <div className="property-group">
                                            <label className="property-label">
                                                TÊN TRƯỜNG: <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="property-input"
                                                value={componentProperties.fieldName || ''}
                                                onChange={(e) => handlePropertyChange('fieldName', e.target.value)}
                                                placeholder="Nhập tên trường"
                                            />
                                        </div>
                                        <div className="property-group">
                                            <label className="property-label">
                                                NGƯỜI NHẬP: <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="property-input"
                                                list={`recipient-suggestions-doc-${selectedComponent.id}`}
                                                value={recipientSearchValue || getRecipientNameById(componentProperties.signer)}
                                                onChange={(e) => handleRecipientSearchChange(e.target.value)}
                                                onBlur={() => {
                                                    // Nếu không tìm thấy recipient, reset về giá trị hiện tại
                                                    if (!recipientSearchValue || !recipientsList.find(r => r.name === recipientSearchValue)) {
                                                        setRecipientSearchValue(getRecipientNameById(componentProperties.signer));
                                                    }
                                                }}
                                                placeholder="Nhập tên để tìm kiếm..."
                                            />
                                            <datalist id={`recipient-suggestions-doc-${selectedComponent.id}`}>
                                                {nameSuggestions.map((suggestion, idx) => (
                                                    <option key={idx} value={suggestion} onClick={() => handleSuggestionSelect(suggestion)} />
                                                ))}
                                            </datalist>
                                            {getActiveRecipientList().length > 0 && (
                                                <select
                                                    className="property-input"
                                                    style={{ marginTop: '8px' }}
                                                    value={componentProperties.signer}
                                                    onChange={(e) => {
                                                        handlePropertyChange('signer', e.target.value);
                                                        setRecipientSearchValue(getRecipientNameById(e.target.value));
                                                    }}
                                                >
                                                    <option value="">Hoặc chọn từ danh sách</option>
                                                    {getActiveRecipientList().map(recipient => (
                                                        <option key={recipient.id} value={recipient.id}>
                                                            {recipient.name} ({recipient.roleName})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Properties cho CHỮ KÝ ẢNH và CHỮ KÝ SỐ */}
                                {(selectedComponent.id === 'image-signature' || selectedComponent.id === 'digital-signature') && (
                                    <div className="property-group">
                                        <label className="property-label">
                                            NGƯỜI KÝ / VĂN THƯ: <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="property-input"
                                            list={`recipient-suggestions-sign-${selectedComponent.id}`}
                                            value={recipientSearchValue || getRecipientNameById(componentProperties.signer)}
                                            onChange={(e) => handleRecipientSearchChange(e.target.value)}
                                            onBlur={() => {
                                                // Nếu không tìm thấy recipient, reset về giá trị hiện tại
                                                if (!recipientSearchValue || !signerRecipients.find(r => r.name === recipientSearchValue)) {
                                                    setRecipientSearchValue(getRecipientNameById(componentProperties.signer));
                                                }
                                            }}
                                            placeholder="Nhập tên để tìm kiếm..."
                                        />
                                        <datalist id={`recipient-suggestions-sign-${selectedComponent.id}`}>
                                            {nameSuggestions.map((suggestion, idx) => (
                                                <option key={idx} value={suggestion} onClick={() => handleSuggestionSelect(suggestion)} />
                                            ))}
                                        </datalist>
                                        {signerRecipients.length > 0 && (
                                            <select
                                                className="property-input"
                                                style={{ marginTop: '8px' }}
                                                value={componentProperties.signer}
                                                onChange={(e) => {
                                                    handlePropertyChange('signer', e.target.value);
                                                    setRecipientSearchValue(getRecipientNameById(e.target.value));
                                                }}
                                            >
                                                <option value="">Hoặc chọn từ danh sách</option>
                                                {signerRecipients.map(recipient => (
                                                    <option key={recipient.id} value={recipient.id}>
                                                        {recipient.name} ({recipient.roleName})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                {/* Properties chung cho tất cả */}
                                <div className="property-group">
                                    <label className="property-label">FONT:</label>
                                    <select
                                        className="property-input"
                                        value={componentProperties.font}
                                        onChange={(e) => handlePropertyChange('font', e.target.value)}
                                    >
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Calibri">Calibri</option>
                                        <option value="Tahoma">Tahoma</option>
                                    </select>
                                </div>

                                <div className="property-group">
                                    <label className="property-label">SIZE:</label>
                                    <input
                                        type="number"
                                        className="property-input"
                                        value={componentProperties.size}
                                        onChange={(e) => handlePropertyChange('size', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="property-group">
                                    <label className="property-label">VỊ TRÍ VÀ KÍCH THƯỚC:</label>
                                    <div className="position-inputs">
                                        <div className="input-row">
                                            <label>X:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={componentProperties.x !== undefined ? parseFloat(componentProperties.x).toFixed(2) : ''}
                                                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value).toFixed(2))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>Y:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={componentProperties.y !== undefined ? parseFloat(componentProperties.y).toFixed(2) : ''}
                                                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value).toFixed(2))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>CHIỀU DÀI:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={componentProperties.height ? parseFloat(componentProperties.height).toFixed(2) : ''}
                                                onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value).toFixed(2))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>CHIỀU RỘNG:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={componentProperties.width ? parseFloat(componentProperties.width).toFixed(2) : ''}
                                                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value).toFixed(2))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Chỉ hiển thị nút Tạo nếu không phải autoCreate component và không đang edit */}
                                {!selectedComponent?.autoCreate && !editingComponentId && (
                                    <button
                                        className="add-component-btn"
                                        onClick={handleAddComponent}
                                        disabled={
                                            !componentProperties.signer ||
                                            (selectedComponent.id === 'text' && !componentProperties.fieldName)
                                        }
                                    >
                                        Thêm vào tài liệu
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="no-selection">
                                <p>Chọn một thành phần để cấu hình thuộc tính</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer với các nút điều hướng - chỉ hiển thị khi không ẩn */}
                {!hideFooter && (
                    <div className="editor-footer">
                        <button className="back-btn" onClick={onBack}>Quay lại</button>
                        <div className="footer-right">
                            <button className="save-draft-btn" onClick={onSaveDraft}>Lưu nháp</button>
                            <div className="footer-actions">
                                {(hasUnassignedComponents || nextWarning) && (
                                    <div className="editor-footer-warning">
                                        {nextWarning || `Vui lòng gán người xử lý cho ${unassignedComponents.length} thành phần trước khi tiếp tục.`}
                                    </div>
                                )}
                                <button
                                    className="next-btn"
                                    onClick={handleNextClick}
                                    disabled={hasUnassignedComponents}
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentEditor;
