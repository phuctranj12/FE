import React, { useState, useEffect, useRef } from 'react';
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
    hideFooter = false 
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
    
    // State cho autocomplete gợi ý tên
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [recipientSearchValue, setRecipientSearchValue] = useState('');
    const suggestionTimeoutRef = useRef(null);

    // Map component types sang field types theo CreateContractFlow.md
    const getFieldType = (componentId) => {
        const typeMap = {
            'document-number': 4,  // CONTRACT_NO
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

    const recipientsList = getRecipientsList();

    // Dữ liệu mẫu cho các thành phần có thể kéo thả
    const availableComponents = [
        {
            id: 'document-number',
            name: 'SỐ TÀI LIỆU',
            icon: '📄',
            type: 'field'
        },
        {
            id: 'text',
            name: 'TEXT',
            icon: 'T',
            type: 'field'
        },
        {
            id: 'image-signature',
            name: 'CHỮ KÝ ẢNH',
            icon: '👤',
            type: 'signature'
        },
        {
            id: 'digital-signature',
            name: 'CHỮ KÝ SỐ',
            icon: '∞',
            type: 'signature',
            hasDropdown: true
        }
    ];

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
        size: 13,
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle page change from PDFViewer (sync với pagination controls)
    const handlePDFPageChange = (page) => {
        setCurrentPage(page);
    };

    const handleComponentSelect = (component) => {
        setSelectedComponent(component);
        setEditingComponentId(null); // Reset editing mode
        setRecipientSearchValue(''); // Reset search value
        setNameSuggestions([]); // Clear suggestions
        // Reset properties khi chọn component mới
        setComponentProperties({
            signer: '',
            font: 'Times New Roman',
            size: 13,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
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
        
        // Tìm recipient trong recipientsList theo tên
        const foundRecipient = recipientsList.find(recipient => 
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
        
        // Tìm recipient trong recipientsList theo tên chính xác
        const foundRecipient = recipientsList.find(recipient => 
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
                        const response = await contractService.getPresignedUrl(documentId);
                        
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

    // Load fields data khi component mount hoặc fieldsData thay đổi
    useEffect(() => {
        if (fieldsData && fieldsData.length > 0 && documentComponents.length === 0) {
            // Convert fieldsData về documentComponents format
            const loadedComponents = fieldsData.map((field, index) => {
                // Map field type về component type
                let componentType = 'text';
                if (field.type === 4) componentType = 'document-number';
                else if (field.type === 2) componentType = 'image-signature';
                else if (field.type === 3) componentType = 'digital-signature';
                
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
                        size: field.fontSize || 13,
                        x: field.boxX || 0,
                        y: field.boxY || 0,
                        width: field.boxW || 100,
                        height: field.boxH || 30,
                        fieldName: field.name || '',
                        ordering: field.ordering || index + 1
                    }
                };
            });
            setDocumentComponents(loadedComponents);
        }
    }, [fieldsData]);

    // Convert documentComponents sang fields format và gọi onFieldsChange
    useEffect(() => {
        if (onFieldsChange && contractId && documentId) {
            const fields = documentComponents
                .filter(component => {
                    // Chỉ include components có recipientId hợp lệ
                    const recipientId = component.properties.recipientId || parseInt(component.properties.signer);
                    return recipientId && !isNaN(recipientId);
                })
                .map((component, index) => {
                    const fieldType = getFieldType(component.type);
                    const recipientId = component.properties.recipientId || parseInt(component.properties.signer);
                    
                    // Đảm bảo boxW và boxH có thể là number hoặc string (theo API)
                    const boxW = component.properties.width || 100;
                    const boxH = component.properties.height || 30;
                    
                    return {
                        // Chỉ include id khi edit (có fieldId)
                        ...(component.fieldId && { id: component.fieldId }),
                        name: component.properties.fieldName || component.name,
                        font: component.properties.font || 'Times New Roman',
                        fontSize: component.properties.size || 13,
                        boxX: component.properties.x || 0,
                        boxY: component.properties.y || 0,
                        page: (component.properties.page || currentPage).toString(),
                        ordering: component.properties.ordering || index + 1,
                        boxW: boxW, // Có thể là number hoặc string
                        boxH: boxH.toString(), // API yêu cầu string cho boxH
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
    }, [documentComponents, contractId, documentId, currentPage, onFieldsChange]);

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
        setComponentProperties(prev => ({
            ...prev,
            [property]: value
        }));
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
        setDocumentComponents(prev => prev.filter(comp => comp.id !== componentId));
    };

    const handleComponentClick = (component) => {
        setEditingComponentId(component.id);
        setComponentProperties(component.properties);
        // Set recipient search value khi click vào component
        const recipientName = getRecipientNameById(component.properties.signer || component.properties.recipientId);
        setRecipientSearchValue(recipientName);
        setSelectedComponent({
            id: component.type,
            name: component.name,
            icon: availableComponents.find(comp => comp.id === component.type)?.icon || '📄'
        });
    };

    const handleUpdateComponent = () => {
        if (editingComponentId) {
            const recipientId = parseInt(componentProperties.signer);
            setDocumentComponents(prev => prev.map(comp => 
                comp.id === editingComponentId 
                    ? { 
                        ...comp, 
                        properties: { 
                            ...componentProperties,
                            recipientId: recipientId,
                            page: currentPage
                        } 
                    }
                    : comp
            ));
        }
    };

    const handleSignatureOptionClick = (option) => {
        if (selectedComponent) {
            const newComponent = {
                id: Date.now(),
                type: selectedComponent.id,
                name: `${selectedComponent.name} - ${option.name}`,
                signatureType: option.id,
                properties: { 
                    ...componentProperties,
                    width: Math.max(componentProperties.width || 100, 50),
                    height: Math.max(componentProperties.height || 30, 20)
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
        if (!component) return;

        setDraggedComponent(component);
        setIsDragging(true);
        setDragStart({
            x: e.clientX - component.properties.x,
            y: e.clientY - component.properties.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !draggedComponent) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        setDocumentComponents(prev => prev.map(comp => 
            comp.id === draggedComponent.id 
                ? { 
                    ...comp, 
                    properties: { 
                        ...comp.properties, 
                        x: newX, 
                        y: newY,
                        page: currentPage // Cập nhật page khi drag
                    } 
                }
                : comp
        ));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedComponent(null);
    };

    // Resize handlers
    const handleResizeStart = (e, componentId, handle) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Resize start:', { componentId, handle, clientX: e.clientX, clientY: e.clientY });
        
        const component = documentComponents.find(comp => comp.id === componentId);
        if (!component) return;

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

        setDocumentComponents(prev => prev.map(comp => 
            comp.id === draggedComponent.id 
                ? { ...comp, properties: { ...comp.properties, width: newWidth, height: newHeight } }
                : comp
        ));

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
                        <label className="radio-option">
                            <input 
                                type="radio" 
                                name="documentType" 
                                value="batch"
                                checked={documentType === 'batch'}
                                readOnly
                            />
                            Tài liệu theo lô
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
                                <PDFViewer
                                    document={{ pdfUrl: pdfUrl }}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    zoom={zoom}
                                    onPageChange={handlePDFPageChange}
                                />
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

                            {/* Document Components - chỉ hiển thị components trên trang hiện tại */}
                            {documentComponents
                                .filter(component => (component.properties.page || component.page || 1) === currentPage)
                                .map(component => (
                                <div 
                                    key={component.id} 
                                    className={`document-component ${editingComponentId === component.id ? 'editing' : ''} ${isDragging && draggedComponent?.id === component.id ? 'dragging' : ''}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${component.properties.x}px`,
                                        top: `${component.properties.y}px`,
                                        width: `${component.properties.width}px`,
                                        height: `${component.properties.height}px`,
                                        fontSize: `${component.properties.size}px`,
                                        fontFamily: component.properties.font,
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                    onMouseEnter={() => setHoveredComponentId(component.id)}
                                    onMouseLeave={() => setHoveredComponentId(null)}
                                    onMouseDown={(e) => handleMouseDown(e, component.id)}
                                    onClick={(e) => {
                                        if (!isDragging) {
                                            handleComponentClick(component);
                                        }
                                    }}
                                >
                                    <div className="component-content">
                                        {component.type === 'text' && component.properties.fieldName 
                                            ? `[${component.properties.fieldName}]` 
                                            : component.signatureType 
                                                ? `[${component.name}]`
                                                : `[${component.name}]`
                                        }
                                    </div>
                                    
                                    {/* Resize handles */}
                                    <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, component.id, 'nw')}></div>
                                    <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, component.id, 'ne')}></div>
                                    <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, component.id, 'sw')}></div>
                                    <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, component.id, 'se')}></div>
                                    
                                    {hoveredComponentId === component.id && (
                                        <button 
                                            className="remove-component-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveComponent(component.id);
                                            }}
                                            title="Xóa component"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Properties */}
                    <div className="properties-sidebar">
                        <h3 className="sidebar-title">THUỘC TÍNH</h3>
                        
                        {selectedComponent ? (
                            <div className="properties-form">
                                {/* Properties cho SỐ TÀI LIỆU */}
                                {selectedComponent.id === 'document-number' && (
                                    <>
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
                                            {recipientsList.length > 0 && (
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
                                                    {recipientsList.map(recipient => (
                                                        <option key={recipient.id} value={recipient.id}>
                                                            {recipient.name} ({recipient.roleName})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </>
                                )}

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
                                            {recipientsList.length > 0 && (
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
                                                    {recipientsList.map(recipient => (
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
                                                NGƯỜI KÝ: <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="property-input"
                                                list={`recipient-suggestions-sign-${selectedComponent.id}`}
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
                                            <datalist id={`recipient-suggestions-sign-${selectedComponent.id}`}>
                                                {nameSuggestions.map((suggestion, idx) => (
                                                    <option key={idx} value={suggestion} onClick={() => handleSuggestionSelect(suggestion)} />
                                                ))}
                                            </datalist>
                                            {recipientsList.length > 0 && (
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
                                                    {recipientsList.map(recipient => (
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
                                                value={componentProperties.x}
                                                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>Y:</label>
                                            <input 
                                                type="number"
                                                value={componentProperties.y}
                                                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>CHIỀU DÀI:</label>
                                            <input 
                                                type="number"
                                                value={componentProperties.height}
                                                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="input-row">
                                            <label>CHIỀU RỘNG:</label>
                                            <input 
                                                type="number"
                                                value={componentProperties.width}
                                                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="add-component-btn"
                                    onClick={editingComponentId ? handleUpdateComponent : handleAddComponent}
                                    disabled={
                                        !componentProperties.signer || 
                                        (selectedComponent.id === 'text' && !componentProperties.fieldName)
                                    }
                                >
                                    {editingComponentId ? 'Cập nhật component' : 'Thêm vào tài liệu'}
                                </button>
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
                            <button className="next-btn" onClick={onNext}>Tiếp theo</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentEditor;
