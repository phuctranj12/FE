import React, { useState, useEffect } from 'react';
import '../../styles/docTypeList.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import SwitchButton from '../common/SwitchButton';
import DocTypeFormModal from './DocTypeFormModal';
import contractService from '../../api/contractService';
import customerService from '../../api/customerService';

const DocTypeList = () => {
    const [docTypes, setDocTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDocType, setEditingDocType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [organizations, setOrganizations] = useState([]);
    const [organizationsMap, setOrganizationsMap] = useState({});
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
        fetchOrganizations();
    }, []);

    useEffect(() => {
        fetchDocTypes(currentPage - 1, itemsPerPage, searchText);
    }, [currentPage]);

    // Refresh doc types when organizationsMap is updated to show organization names
    useEffect(() => {
        if (Object.keys(organizationsMap).length > 0 && docTypes.length > 0) {
            const updatedTypes = docTypes.map(docType => ({
                ...docType,
                organizationName: organizationsMap[docType.organizationId] || `Tổ chức ID: ${docType.organizationId}`
            }));
            setDocTypes(updatedTypes);
        }
    }, [organizationsMap]);

    // Fetch organizations to map organizationId to organization name
    const fetchOrganizations = async () => {
        try {
            const response = await customerService.getAllOrganizations({
                page: 0,
                size: 1000 // Get all organizations
            });
            if (response.code === 'SUCCESS' && response.data) {
                const orgs = response.data.content || [];
                setOrganizations(orgs);
                // Create a map for quick lookup
                const map = {};
                orgs.forEach(org => {
                    map[org.id] = org.name;
                });
                setOrganizationsMap(map);
            }
        } catch (e) {
            console.error('Error fetching organizations:', e);
        }
    };

    const fetchDocTypes = async (page = 0, size = 10, textSearch = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await contractService.getAllTypes({
                page,
                size,
                textSearch: textSearch.trim()
            });

            if (response.code === 'SUCCESS' && response.data) {
                const types = response.data.content || [];
                const mappedTypes = types.map(apiType => ({
                    id: apiType.id,
                    name: apiType.name,
                    status: apiType.status,
                    organizationId: apiType.organizationId,
                    organizationName: organizationsMap[apiType.organizationId] || `Tổ chức ID: ${apiType.organizationId}`
                }));
                setDocTypes(mappedTypes);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);
            } else {
                const errorMsg = response.message || 'Không thể tải danh sách loại tài liệu';
                setError(errorMsg);
                showToast(errorMsg, 'error');
                setDocTypes([]);
            }
        } catch (e) {
            console.error('Error fetching doc types:', e);
            const errorMsg = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi tải danh sách loại tài liệu';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setDocTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchDocTypes(0, itemsPerPage, searchText);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddNew = () => {
        setEditingDocType(null);
        setShowModal(true);
    };

    const handleEdit = (docType) => {
        setEditingDocType(docType);
        setShowModal(true);
    };

    const handleDelete = async (docType) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa loại tài liệu "${docType.name}"?`)) {
            try {
                await contractService.deleteType(docType.id);
                showToast('Xóa loại tài liệu thành công', 'success', 3000);
                // Refresh the list after deletion
                fetchDocTypes(currentPage - 1, itemsPerPage, searchText);
            } catch (error) {
                console.error('Error deleting doc type:', error);
                const errorMsg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi xóa loại tài liệu';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        }
    };

    const handleStatusToggle = async (docType, newValue) => {
        try {
            // Update status: 1 = active, 0 = inactive
            const newStatus = newValue ? 1 : 0;
            await contractService.updateType(docType.id, {
                id: docType.id,
                name: docType.name,
                organizationId: docType.organizationId,
                status: newStatus
            });
            showToast('Cập nhật trạng thái thành công', 'success', 3000);
            // Refresh the list after update
            fetchDocTypes(currentPage - 1, itemsPerPage, searchText);
        } catch (error) {
            console.error('Error updating status:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        }
    };

    const handleSave = async (docType) => {
        try {
            if (editingDocType) {
                // Update existing
                await contractService.updateType(editingDocType.id, docType);
                showToast('Cập nhật loại tài liệu thành công', 'success', 3000);
            } else {
                // Add new
                await contractService.createType(docType);
                showToast('Tạo loại tài liệu thành công', 'success', 3000);
            }
            setShowModal(false);
            // Refresh the list after save
            fetchDocTypes(currentPage - 1, itemsPerPage, searchText);
        } catch (error) {
            console.error('Error saving doc type:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi lưu loại tài liệu';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingDocType(null);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalElements);

    return (
        <>
            {/* Toast notifications */}
            {toasts.length > 0 && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {toasts.map((t) => (
                        <div 
                            key={t.id} 
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
                                background: t.variant === 'success' ? '#d4edda' : '#f8d7da',
                                color: t.variant === 'success' ? '#155724' : '#721c24',
                                border: `1px solid ${t.variant === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: 14,
                                fontWeight: 500,
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
                                    color: t.variant === 'success' ? '#155724' : '#721c24',
                                    marginLeft: 8,
                                    padding: 0,
                                    lineHeight: 1,
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="doc-type-container">
            <div className="search-section">
                <div className="search-inputs" >
                    <SearchBar
                        placeholder="Tìm kiếm theo tên, mã loại tài liệu..."
                        value={searchText}
                        onChange={setSearchText}
                    />
                </div>
                <div className="action-buttons">
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="transparent"
                        text="Tìm kiếm"
                        onClick={handleSearch}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="#0B57D0"
                        text="Thêm mới"
                        onClick={handleAddNew}
                    />
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-message">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <BaseTable
                        columns={[
                            'Tên loại tài liệu',
                            'Tên tổ chức',
                            'Active',
                            'Quản lý'
                        ]}
                        data={docTypes.map((docType) => ([
                            <span className="doc-type-name" key={`name-${docType.id}`}>{docType.name}</span>,
                            docType.organizationName,
                            (
                                <div className="auto-sign-cell" key={`status-${docType.id}`}>
                                    <SwitchButton
                                        checked={docType.status === 1}
                                    />
                                </div>
                            ),
                            (
                                <div className="action-buttons-cell" key={`actions-${docType.id}`}>
                                    <button
                                        className="edit-btn"
                                        title="Chỉnh sửa"
                                        onClick={() => handleEdit(docType)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="delete-btn"
                                        title="Xóa"
                                        onClick={() => handleDelete(docType)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )
                        ]))}
                    />

                    <div className="pagination-container">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onChange={handlePageChange}
                        />
                        <div className="pagination-info">
                            Số lượng: {startIndex + 1} - {endIndex} / {totalElements}
                        </div>
                    </div>
                </>
            )}

            {showModal && (
                <DocTypeFormModal
                    docType={editingDocType}
                    onSave={handleSave}
                    onClose={handleModalClose}
                />
            )}
        </div>
        </>
    );
};

export default DocTypeList;

