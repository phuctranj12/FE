import React, { useState, useEffect } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import AddNewRolePanel from './AddNewRolePanel';
import EditRolePanel from './EditRolePanel';
import ViewRolePanel from './ViewRolePanel';
import customerService from '../../api/customerService';

const RoleList = ({ onAddNew }) => {
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [searchName, setSearchName] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [showAddRole, setShowAddRole] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showEditRole, setShowEditRole] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [showViewRole, setShowViewRole] = useState(false);
    const [viewingRole, setViewingRole] = useState(null);
    const [allPermissions, setAllPermissions] = useState([]);
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
        const fetchPermissions = async () => {
            try {
                const res = await customerService.getAllPermissions({ page: 0, size: 1000 });
                if (res.code === 'SUCCESS') {
                    const list = Array.isArray(res.data?.content) ? res.data.content : [];
                    setAllPermissions(list.map(p => ({ id: p.id, name: p.name, category: p.category || 'Khác' })));
                }
            } catch {}
        };
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const textSearch = (searchName || searchCode || '').trim();
            const response = await customerService.getAllRoles({
                textSearch,
                page: currentPage - 1,
                size: itemsPerPage
            });
            if (response.code === 'SUCCESS') {
                const { content = [], totalPages = 0, totalElements = 0 } = response.data || {};
                setRoles(content);
                setFilteredRoles(content);
                setTotalPages(totalPages);
                setTotalElements(totalElements);
            } else {
                showToast(response.message || 'Không thể tải danh sách vai trò', 'error');
            }
        } catch (e) {
            showToast(e.message || 'Đã xảy ra lỗi khi tải danh sách vai trò', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchRoles();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginatedData = () => filteredRoles;

    const startItem = filteredRoles.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalElements);

    const handleEdit = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setEditingRole(role);
            setShowEditRole(true);
        } else {
            showToast('Không tìm thấy dữ liệu vai trò trong danh sách', 'error');
        }
    };

    const handleView = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            setViewingRole(role);
            setShowViewRole(true);
        } else {
            showToast('Không tìm thấy dữ liệu vai trò trong danh sách', 'error');
        }
    };

    const handleDelete = async (roleId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;
        try {
            setLoading(true);
            const res = await customerService.deleteRole(roleId);
            if (res.code === 'SUCCESS') {
                showToast('Xóa vai trò thành công', 'success', 3000);
                await fetchRoles();
            } else {
                showToast('Không thể xóa vai trò: ' + (res.message || 'Unknown error'), 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi xóa vai trò', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!!toasts.length && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            {showAddRole && (
                <AddNewRolePanel allPermissions={allPermissions} onCancel={() => { setShowAddRole(false); }} />
            )}
            {showEditRole && editingRole && (
                <EditRolePanel 
                    role={editingRole}
                    allPermissions={allPermissions}
                    onCancel={() => { setShowEditRole(false); setEditingRole(null); }}
                    onSaved={async () => { setShowEditRole(false); setEditingRole(null); await fetchRoles(); }}
                />
            )}
            {showViewRole && viewingRole && (
                <ViewRolePanel 
                    role={viewingRole}
                    allPermissions={allPermissions}
                    onCancel={() => { setShowViewRole(false); setViewingRole(null); }}
                />
            )}
            <div className="user-management-container">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'baseline' }}>
                    <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                        <SearchBar placeholder="Tên vai trò" value={searchName} onChange={setSearchName} />
                    </div>
                    <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                        <SearchBar placeholder="Mã vai trò" value={searchCode} onChange={setSearchCode} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                        <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" onClick={handleSearch} />
                        <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={() => setShowAddRole(true)} />
                    </div>
                </div>
                <div className="template-link template-right"></div>
                {loading && (
                    <div style={{ padding: '12px' }}>Đang tải...</div>
                )}
                <BaseTable
                    columns={[ 'Tên vai trò', 'Mã vai trò', 'Quản lý' ]}
                    data={getPaginatedData().map(role => ([
                        (<span 
                            key={`name-${role.id}`}
                            onClick={() => handleView(role.id)}
                            style={{ cursor: 'pointer', color: '#0B57D0' }}
                        >
                            {role.name}
                        </span>),
                        role.code,
                        (
                            <div key={`actions-${role.id}`} className="action-buttons-cell">
                                <button 
                                    className="edit-btn" 
                                    title="Chỉnh sửa"
                                    onClick={() => handleEdit(role.id)}
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="delete-btn" 
                                    title="Xóa"
                                    onClick={() => handleDelete(role.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        )
                    ]))}
                />

                <div className="pagination-container">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
                    <div className="pagination-info">
                        Số lượng {startItem} - {endItem} / {totalElements}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleList;
