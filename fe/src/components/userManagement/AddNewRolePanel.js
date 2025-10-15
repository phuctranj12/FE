import React, { useState } from 'react';
import '../../styles/addNewRolePanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';

const AddNewRolePanel = ({ onCancel }) => {
    const [formData, setFormData] = useState({
        roleName: '',
        roleCode: '',
        note: '',
        permissions: []
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Sample permissions data
    const permissions = [
        {
            id: 1,
            name: 'Xem danh sách tài liệu tổ chức của tôi',
            category: 'Tài liệu'
        },
        {
            id: 2,
            name: 'Tìm kiếm tài liệu',
            category: 'Tài liệu'
        },
        {
            id: 3,
            name: 'Xem thông tin chi tiết tài liệu',
            category: 'Tài liệu'
        },
        {
            id: 4,
            name: 'Sao chép tài liệu',
            category: 'Tài liệu'
        },
        {
            id: 5,
            name: 'Hủy tài liệu',
            category: 'Tài liệu'
        },
        {
            id: 6,
            name: 'Xem lịch sử tài liệu',
            category: 'Tài liệu'
        },
        {
            id: 7,
            name: 'Tạo tài liệu liên quan',
            category: 'Tài liệu'
        },
        {
            id: 8,
            name: 'Xem tài liệu liên quan',
            category: 'Tài liệu'
        },
        {
            id: 9,
            name: 'Quản lý người dùng',
            category: 'Quản trị'
        },
        {
            id: 10,
            name: 'Quản lý tổ chức',
            category: 'Quản trị'
        },
        {
            id: 11,
            name: 'Quản lý vai trò',
            category: 'Quản trị'
        },
        {
            id: 12,
            name: 'Xem báo cáo',
            category: 'Báo cáo'
        },
        {
            id: 13,
            name: 'Xuất báo cáo',
            category: 'Báo cáo'
        }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePermissionChange = (permissionId, checked) => {
        setFormData(prev => ({
            ...prev,
            permissions: checked 
                ? [...prev.permissions, permissionId]
                : prev.permissions.filter(id => id !== permissionId)
        }));
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.roleName || !formData.roleCode || formData.permissions.length === 0) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }
        
        console.log('Saving role:', formData);
        // Implement save logic here
        onCancel && onCancel();
    };

    const handleCancel = () => {
        onCancel && onCancel();
    };

    // Filter permissions based on search term
    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group permissions by category
    const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
        const category = permission.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(permission);
        return groups;
    }, {});

    return (
        <div className="add-role-overlay">
            <div className="add-role-panel">
                <div className="add-role-header">
                    <h2>THÊM MỚI VAI TRÒ</h2>
                </div>

                <div className="add-role-content">
                    {/* Left Column - Form Fields */}
                    <div className="role-form-column">
                        <div className="form-group">
                            <label>Tên vai trò <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập tên vai trò" 
                                value={formData.roleName} 
                                onChange={(value) => handleInputChange('roleName', value)} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Mã vai trò <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập mã vai trò" 
                                value={formData.roleCode} 
                                onChange={(value) => handleInputChange('roleCode', value)} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Ghi chú</label>
                            <SearchBar 
                                placeholder="Nhập ghi chú" 
                                value={formData.note} 
                                onChange={(value) => handleInputChange('note', value)} 
                            />
                        </div>
                    </div>

                    {/* Right Column - Permissions */}
                    <div className="role-permissions-column">
                        <div className="form-group">
                            <label>Phân quyền <span className="required">*</span></label>
                            <div className="permissions-container">
                                <div className="permissions-search">
                                    <SearchBar 
                                        placeholder="Tìm kiếm quyền..." 
                                        value={searchTerm} 
                                        onChange={setSearchTerm} 
                                    />
                                </div>
                                
                                <div className="permissions-list">
                                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                        <div key={category} className="permission-category">
                                            <div className="category-header">
                                                <span className="category-name">{category}</span>
                                                <span className="expand-icon">▼</span>
                                            </div>
                                            <div className="category-permissions">
                                                {categoryPermissions.map(permission => (
                                                    <label key={permission.id} className="permission-item">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.permissions.includes(permission.id)}
                                                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                                        />
                                                        <span className="permission-text">{permission.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="add-role-actions">
                    <Button 
                        outlineColor="#6c757d" 
                        backgroundColor="transparent" 
                        text="Hủy bỏ" 
                        onClick={handleCancel}
                    />
                    <Button 
                        outlineColor="#0B57D0" 
                        backgroundColor="#0B57D0" 
                        text="Lưu lại" 
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddNewRolePanel;
