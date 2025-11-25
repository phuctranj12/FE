import React, { useEffect, useState } from 'react';
import '../../styles/addNewRolePanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';

const ViewRolePanel = ({ role, onCancel, allPermissions = [] }) => {
    const [formData, setFormData] = useState({
        roleName: '',
        note: '',
        permissions: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (!role) return;
        const permissionIds = Array.isArray(role.permissionIds)
            ? role.permissionIds
            : Array.isArray(role.permissions)
                ? role.permissions.map(p => p.id)
                : [];
        setFormData({
            roleName: role.name || '',
            note: role.note || '',
            permissions: permissionIds
        });
    }, [role]);

    // Filter and group allPermissions (the full list), to show full list with only ticked for role's permissions
    const filteredPermissions = allPermissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
        const category = permission.category || 'Khác';
        if (!groups[category]) groups[category] = [];
        groups[category].push(permission);
        return groups;
    }, {});

    return (
        <div className="add-role-overlay">
            <div className="add-role-panel">
                <div className="add-role-header">
                    <h2>THÔNG TIN VAI TRÒ</h2>
                </div>
                <div className="add-role-content">
                    {/* Left Column - Form Fields */}
                    <div className="role-form-column">
                        <div className="form-group">
                            <label>Tên vai trò</label>
                            <SearchBar 
                                placeholder="Tên vai trò" 
                                value={formData.roleName} 
                                onChange={() => {}} 
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Ghi chú</label>
                            <SearchBar 
                                placeholder="Ghi chú" 
                                value={formData.note} 
                                onChange={() => {}} 
                                disabled
                            />
                        </div>
                    </div>
                    {/* Right Column - Permissions */}
                    <div className="role-permissions-column">
                        <div className="form-group">
                            <label>Phân quyền</label>
                            {allPermissions.length > 0 ? (
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
                                                        <label key={permission.id} className="permission-item" style={{ opacity: 0.7 }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={formData.permissions.includes(permission.id)}
                                                                readOnly
                                                                disabled
                                                            />
                                                            <span className="permission-text">{permission.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {formData.permissions.map(pid => (
                                        <span key={pid} style={{
                                            background: '#f1f3f4',
                                            border: '1px solid #e0e0e0',
                                            padding: '4px 8px',
                                            borderRadius: 12,
                                            fontSize: 12
                                        }}>#{pid}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="add-role-actions">
                    <Button 
                        outlineColor="#6c757d" 
                        backgroundColor="transparent" 
                        text="Đóng" 
                        onClick={onCancel}
                    />
                </div>
            </div>
        </div>
    );
};

export default ViewRolePanel;


