import React, { useState, useEffect } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import AddNewRolePanel from './AddNewRolePanel';

const RoleList = ({ onAddNew }) => {
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [searchName, setSearchName] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [showAddRole, setShowAddRole] = useState(false);

    // Sample data
    useEffect(() => {
        const sampleData = [
            { id: 1, name: 'aadmin 2', code: 'admin2' },
            { id: 2, name: 'Admin', code: 'ADMIN' },
            { id: 3, name: 'admin123', code: 'admin123' },
            { id: 4, name: 'AdminLite', code: 'adminlite' },
            { id: 5, name: 'Automation tạo tên vai trò rdoume', code: 'rbjrak' },
            { id: 6, name: 'Automation tạo tên vai trò syxpmu', code: 'fctxvw' },
            { id: 7, name: 'BGĐ', code: 'BGD' },
            { id: 8, name: 'BUTEST', code: 'BUTEST' },
            { id: 9, name: 'CHECKCOPYTEMPLATE', code: 'CHECKCOPYTEMPLATE' },
            { id: 10, name: 'ChinhNhun', code: '123' },
            { id: 11, name: 'e', code: 'e' },
            { id: 12, name: 'Member', code: 'MEMBER' },
            { id: 13, name: 'NEW VT', code: 'NEWVT' },
            { id: 14, name: 'NLĐ', code: 'NLD' },
            { id: 15, name: 'NOTAD', code: 'NOTAD' }
        ];
        setRoles(sampleData);
        setFilteredRoles(sampleData);
    }, []);

    const handleSearch = () => {
        const filtered = roles.filter(role => {
            const matchesName = searchName === '' || role.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesCode = searchCode === '' || role.code.toLowerCase().includes(searchCode.toLowerCase());
            return matchesName && matchesCode;
        });
        setFilteredRoles(filtered);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredRoles.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredRoles.length);

    const handleEdit = (roleId) => {
        console.log('Edit role:', roleId);
        // Implement edit functionality
    };

    const handleDelete = (roleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
            setRoles(roles.filter(role => role.id !== roleId));
            setFilteredRoles(filteredRoles.filter(role => role.id !== roleId));
        }
    };

    return (
        <>
            {showAddRole && (
                <AddNewRolePanel onCancel={() => setShowAddRole(false)} />
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
                        <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" />
                        <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={() => setShowAddRole(true)} />
                    </div>
                </div>
                <div className="template-link template-right"></div>
                <BaseTable
                    columns={[ 'Tên vai trò', 'Mã vai trò', 'Quản lý' ]}
                    data={getPaginatedData().map(role => ([
                        role.name,
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
                    <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
                    <div className="pagination-info">
                        Số lượng {startItem} - {endItem} / {filteredRoles.length}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleList;
