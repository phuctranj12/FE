import React, { useEffect, useState } from 'react';
import '../../styles/addNewRolePanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import customerService from '../../api/customerService';

const EditRolePanel = ({ role, onCancel, onSaved }) => {
    const [formData, setFormData] = useState({
        roleName: '',
        roleCode: '',
        note: '',
        permissions: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        if (!role) return;
        const permissionIds = Array.isArray(role.permissionIds)
            ? role.permissionIds
            : Array.isArray(role.permissions)
                ? role.permissions.map(p => p.id)
                : [];
        setFormData({
            roleName: role.name || '',
            roleCode: role.code || '',
            note: role.note || '',
            permissions: permissionIds
        });
    }, [role]);

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
        if (!role?.id) {
            alert('Thiếu ID vai trò');
            return;
        }
        if (formData.permissions.length === 0) {
            alert('Vui lòng chọn ít nhất một phân quyền');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                name: formData.roleName,
                code: formData.roleCode,
                note: formData.note,
                permissionIds: formData.permissions
            };
            const res = await customerService.updateRole(role.id, payload);
            if (res.code === 'SUCCESS') {
                onSaved && onSaved();
            } else {
                alert('Không thể cập nhật vai trò: ' + (res.message || 'Unknown error'));
            }
        } catch (e) {
            alert(e.response?.data?.message || e.message || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
        const category = permission.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push(permission);
        return groups;
    }, {});

    return (
        <div className="add-role-overlay">
            <div className="add-role-panel">
                <div className="add-role-header">
                    <h2>CẬP NHẬT VAI TRÒ</h2>
                </div>

                <div className="add-role-content">
                    <div className="role-form-column">
                        <div className="form-group">
                            <label>Tên vai trò <span className="required">*</span></label>
                            <SearchBar
                                placeholder="Tên vai trò"
                                value={formData.roleName}
                                onChange={(value) => handleInputChange('roleName', value)}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Mã vai trò <span className="required">*</span></label>
                            <SearchBar
                                placeholder="Mã vai trò"
                                value={formData.roleCode}
                                onChange={(value) => handleInputChange('roleCode', value)}
                                disabled
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
                        onClick={onCancel}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="#0B57D0"
                        text={loading ? 'Đang lưu...' : 'Lưu lại'}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditRolePanel;


