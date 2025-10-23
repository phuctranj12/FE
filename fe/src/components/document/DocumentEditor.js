import React, { useState } from 'react';
import '../../styles/documentEditor.css';

function DocumentEditor({ documentType = 'single-template', onBack, onNext, onSaveDraft, hideFooter = false }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(46);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [documentComponents, setDocumentComponents] = useState([]);
    const [showSignatureDropdown, setShowSignatureDropdown] = useState(false);

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

    const handleComponentSelect = (component) => {
        setSelectedComponent(component);
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

    const handlePropertyChange = (property, value) => {
        setComponentProperties(prev => ({
            ...prev,
            [property]: value
        }));
    };

    const handleAddComponent = () => {
        if (selectedComponent) {
            const newComponent = {
                id: Date.now(),
                type: selectedComponent.id,
                name: selectedComponent.name,
                properties: { ...componentProperties }
            };
            setDocumentComponents(prev => [...prev, newComponent]);
        }
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
                                        onClick={() => handleComponentSelect(component)}
                                        onMouseEnter={() => component.hasDropdown && setShowSignatureDropdown(true)}
                                        onMouseLeave={() => component.hasDropdown && setShowSignatureDropdown(false)}
                                    >
                                        <span className="component-icon">{component.icon}</span>
                                        <span className="component-name">{component.name}</span>
                                        {component.hasDropdown && <span className="dropdown-arrow">›</span>}
                                    </button>
                                    
                                    {/* Dropdown cho chữ ký số */}
                                    {component.hasDropdown && showSignatureDropdown && (
                                        <div 
                                            className="signature-dropdown"
                                            onMouseEnter={() => setShowSignatureDropdown(true)}
                                            onMouseLeave={() => setShowSignatureDropdown(false)}
                                        >
                                            {signatureOptions.map(option => (
                                                <div key={option.id} className="signature-option">
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
                        <div className="document-page">
                            <div className="document-header">
                                <h1>I. Đăng nhập hệ thống</h1>
                                <h2>1.1. Đăng ký</h2>
                            </div>
                            
                            <div className="document-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tên chức năng</th>
                                            <th>Đăng ký</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Đăng ký</td>
                                            <td>
                                                <div className="function-description">
                                                    <p><strong>Mô tả:</strong> Cho phép người dùng đăng ký sử dụng hệ thống. Thông tin đăng ký bao gồm:</p>
                                                    <ul>
                                                        <li>Email đăng ký(*)</li>
                                                        <li>Mã số thuế / CCCD / CMT (*)</li>
                                                        <li>Số điện thoại (*)</li>
                                                        <li>Mật khẩu (*)</li>
                                                        <li>Họ và tên (*)</li>
                                                    </ul>
                                                    
                                                    <p><strong>Tác nhân:</strong> Người dùng đăng ký sử dụng hệ thống</p>
                                                    
                                                    <p><strong>Điều kiện trước:</strong> Truy cập vào trang web eContract và chọn đăng ký</p>
                                                    
                                                    <p><strong>Điều kiện sau:</strong> Người dùng gửi thông tin đăng ký sử dụng hệ thống thành công. Hệ thống sẽ gửi thông báo đến cho trang quản trị hệ thống, thông tin tổ chức được thêm mới vào danh sách tổ chức sử dụng dịch vụ của trang quản trị và có trạng thái "Chưa kích hoạt"</p>
                                                    
                                                    <p><strong>Ngoại lệ 1:</strong> Người dùng nhập không đủ các trường thông tin bắt buộc. Hệ thống thông báo tại trường thông tin đó: "Đây là trường bắt buộc nhập"</p>
                                                    
                                                    <p><strong>Ngoại lệ 2:</strong> Người dùng nhập thông tin email đã được cấp tài khoản trên hệ thống. Hệ thống thông báo: "Tài khoản đã tồn tại trên hệ thống"</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Document Components */}
                            {documentComponents.map(component => (
                                <div 
                                    key={component.id} 
                                    className="document-component"
                                    style={{
                                        position: 'absolute',
                                        left: `${component.properties.x}px`,
                                        top: `${component.properties.y}px`,
                                        width: `${component.properties.width}px`,
                                        height: `${component.properties.height}px`,
                                        fontSize: `${component.properties.size}px`,
                                        fontFamily: component.properties.font
                                    }}
                                >
                                    [{component.name}]
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Properties */}
                    <div className="properties-sidebar">
                        <h3 className="sidebar-title">THUỘC TÍNH</h3>
                        
                        {selectedComponent ? (
                            <div className="properties-form">
                                <div className="property-group">
                                    <label className="property-label">
                                        NGƯỜI KÝ: <span className="required">*</span>
                                    </label>
                                    <select 
                                        className="property-input"
                                        value={componentProperties.signer}
                                        onChange={(e) => handlePropertyChange('signer', e.target.value)}
                                    >
                                        <option value="">Chọn người ký</option>
                                        <option value="user1">Nguyễn Văn A</option>
                                        <option value="user2">Trần Thị B</option>
                                        <option value="user3">Lê Văn C</option>
                                    </select>
                                </div>

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
                                    onClick={handleAddComponent}
                                    disabled={!componentProperties.signer}
                                >
                                    Thêm vào tài liệu
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
