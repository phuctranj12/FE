import React, { useState, useEffect } from 'react';
import '../../styles/addNewRolePanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import customerService from '../../api/customerService';

const AddNewRolePanel = ({ onCancel, allPermissions }) => {
    const [formData, setFormData] = useState({
        roleName: '',
        note: '',
        permissions: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [permissions, setPermissions] = useState(allPermissions || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (allPermissions && allPermissions.length > 0) {
            setPermissions(allPermissions);
            return;
        }
        // Nếu không có allPermissions, fetch như cũ
        const loadPermissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await customerService.getAllPermissions({ page: 0, size: 1000 });
                if (res.code === 'SUCCESS') {
                    const list = Array.isArray(res.data?.content) ? res.data.content : [];
                    setPermissions(list.map(p => ({ id: p.id, name: p.name, category: p.category || 'Khác' })));
                } else {
                    setError(res.message || 'Không thể tải danh sách phân quyền');
                }
            } catch (e) {
                setError(e.response?.data?.message || e.message || 'Lỗi tải phân quyền');
            } finally {
                setLoading(false);
            }
        };
        loadPermissions();
    }, [allPermissions]);

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

    const handleSave = async () => {
        // Validate required fields
        if (!formData.roleName || formData.permissions.length === 0) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                name: formData.roleName,
                note: formData.note,
                permissionIds: formData.permissions
            };
            const res = await customerService.createRole(payload);
            if (res.code === 'SUCCESS') {
                alert('Tạo vai trò thành công');
                onCancel && onCancel();
            } else {
                alert('Không thể tạo vai trò: ' + (res.message || 'Unknown error'));
            }
        } catch (e) {
            alert(e.response?.data?.message || e.message || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
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
                                                            onChange={e => handlePermissionChange(permission.id, e.target.checked)}
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
                        text={loading ? 'Đang lưu...' : 'Lưu lại'} 
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddNewRolePanel;
