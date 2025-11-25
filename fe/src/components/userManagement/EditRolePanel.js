import React, { useEffect, useState } from 'react';
import '../../styles/addNewRolePanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import customerService from '../../api/customerService';

const EditRolePanel = ({ role, onCancel, onSaved, allPermissions = [] }) => {
    const [formData, setFormData] = useState({
        roleName: '',
        note: '',
        permissions: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [permissions, setPermissions] = useState(allPermissions || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toasts, setToasts] = useState([]);

    const showToast = (message, variant = 'error', durationMs = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    useEffect(() => {
        if (role) {
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
        }
    }, [role]);

    useEffect(() => {
        if (allPermissions && allPermissions.length > 0) {
            setPermissions(allPermissions);
            return;
        }
        // Nếu không có truyền vào, fetch lại
        const loadPermissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await customerService.getAllPermissions({ page: 0, size: 1000 });
                if (res.code === 'SUCCESS') {
                    const list = Array.isArray(res.data?.content) ? res.data.content : [];
                    setPermissions(list.map(p => ({ id: p.id, name: p.name, category: p.category || 'Khác' })));
                } else {
                    showToast(res.message || 'Không thể tải danh sách phân quyền', 'error');
                }
            } catch (e) {
                showToast(e.response?.data?.message || e.message || 'Lỗi tải phân quyền', 'error');
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
        if (!role?.id) {
            showToast('Thiếu ID vai trò', 'error');
            return;
        }
        if (formData.permissions.length === 0) {
            showToast('Vui lòng chọn ít nhất một phân quyền', 'warning');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                name: formData.roleName,
                note: formData.note,
                permissionIds: formData.permissions
            };
            const res = await customerService.updateRole(role.id, payload);
            if (res.code === 'SUCCESS') {
                showToast('Cập nhật vai trò thành công', 'success', 3000);
                // Delay đóng form để user có thể thấy toast
                setTimeout(() => {
                    onSaved && onSaved();
                }, 500);
            } else {
                showToast('Không thể cập nhật vai trò: ' + (res.message || 'Unknown error'), 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || e.message || 'Đã xảy ra lỗi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredPermissions = permissions.filter(permission =>
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
            {!!toasts.length && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10001, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {toasts.map((t) => (
                        <div 
                            key={t.id} 
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
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
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    marginLeft: 12,
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
            <div className="add-role-panel">
                <div className="add-role-header">
                    <h2>CẬP NHẬT THÔNG TIN VAI TRÒ</h2>
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
                            <label>Phân quyền</label>
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


