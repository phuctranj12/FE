import React, { useState, useEffect } from 'react';
import '../../styles/docTypeList.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import SwitchButton from '../common/SwitchButton';
import DocTypeFormModal from './DocTypeFormModal';

const DocTypeList = () => {
    const [docTypes, setDocTypes] = useState([]);
    const [filteredDocTypes, setFilteredDocTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDocType, setEditingDocType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock data - Replace with API call later
    const mockDocTypes = [
        {
            id: 1,
            code: 'HD-DV',
            name: 'Hợp đồng dịch vụ',
            description: 'Hợp đồng cung cấp dịch vụ',
            autoSign: true,
            status: 1,
            createdDate: '2024-01-15',
            createdBy: 'Admin'
        },
        {
            id: 2,
            code: 'HD-MH',
            name: 'Hợp đồng mua hàng',
            description: 'Hợp đồng mua bán hàng hóa',
            autoSign: false,
            status: 1,
            createdDate: '2024-01-20',
            createdBy: 'Admin'
        },
        {
            id: 3,
            code: 'HD-TD',
            name: 'Hợp đồng thuê đất',
            description: 'Hợp đồng thuê đất và mặt bằng',
            autoSign: true,
            status: 1,
            createdDate: '2024-02-01',
            createdBy: 'Admin'
        },
        {
            id: 4,
            code: 'HD-LD',
            name: 'Hợp đồng lao động',
            description: 'Hợp đồng lao động với nhân viên',
            autoSign: false,
            status: 1,
            createdDate: '2024-02-10',
            createdBy: 'Admin'
        },
        {
            id: 5,
            code: 'BB-BG',
            name: 'Biên bản bàn giao',
            description: 'Biên bản bàn giao tài sản, công việc',
            autoSign: true,
            status: 1,
            createdDate: '2024-02-15',
            createdBy: 'Admin'
        },
        {
            id: 6,
            code: 'GN-UQ',
            name: 'Giấy ủy quyền',
            description: 'Giấy ủy quyền đại diện',
            autoSign: false,
            status: 0,
            createdDate: '2024-02-20',
            createdBy: 'Admin'
        },
        {
            id: 7,
            code: 'HD-TV',
            name: 'Hợp đồng tư vấn',
            description: 'Hợp đồng tư vấn dịch vụ',
            autoSign: true,
            status: 1,
            createdDate: '2024-03-01',
            createdBy: 'Admin'
        }
    ];

    useEffect(() => {
        fetchDocTypes();
    }, []);

    const fetchDocTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual API call
            // const response = await apiService.getDocTypes();
            setTimeout(() => {
                setDocTypes(mockDocTypes);
                setFilteredDocTypes(mockDocTypes);
                setLoading(false);
            }, 500);
        } catch (e) {
            setError('Đã xảy ra lỗi khi tải danh sách loại tài liệu');
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchText.trim()) {
            setFilteredDocTypes(docTypes);
        } else {
            const filtered = docTypes.filter(doc =>
                doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
                doc.code.toLowerCase().includes(searchText.toLowerCase()) ||
                (doc.description && doc.description.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredDocTypes(filtered);
        }
        setCurrentPage(1);
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

    const handleDelete = (docType) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa loại tài liệu "${docType.name}"?`)) {
            // TODO: Call API to delete
            const updated = docTypes.filter(d => d.id !== docType.id);
            setDocTypes(updated);
            setFilteredDocTypes(updated);
        }
    };

    const handleAutoSignToggle = (docType, newValue) => {
        // TODO: Call API to update autoSign
        const updated = docTypes.map(d => 
            d.id === docType.id ? { ...d, autoSign: newValue } : d
        );
        setDocTypes(updated);
        setFilteredDocTypes(updated);
    };

    const handleSave = (docType) => {
        if (editingDocType) {
            // Update existing
            const updated = docTypes.map(d => d.id === docType.id ? docType : d);
            setDocTypes(updated);
            setFilteredDocTypes(updated);
        } else {
            // Add new
            const newDocType = { ...docType, id: Date.now() };
            setDocTypes([...docTypes, newDocType]);
            setFilteredDocTypes([...docTypes, newDocType]);
        }
        setShowModal(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingDocType(null);
    };

    const totalPages = Math.ceil(filteredDocTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredDocTypes.length);
    const currentDocTypes = filteredDocTypes.slice(startIndex, endIndex);

    return (
        <div className="doc-type-container">
            <div className="search-section">
                <div className="search-inputs">
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
                            'Mã loại tài liệu',
                            'Ký tự động',
                            'Quản lý'
                        ]}
                        data={currentDocTypes.map((docType) => ([
                            <span className="doc-type-name" key={`name-${docType.id}`}>{docType.name}</span>,
                            docType.code,
                            (
                                <div className="auto-sign-cell" key={`autosign-${docType.id}`}>
                                    <SwitchButton
                                        checked={docType.autoSign}
                                        onChange={(checked) => handleAutoSignToggle(docType, checked)}
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
                            Số lượng: {startIndex + 1} - {endIndex} / {filteredDocTypes.length}
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
    );
};

export default DocTypeList;

