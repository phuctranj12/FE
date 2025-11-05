import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import OrganizationDropDown from '../common/OrganizationDropDown';
import customerService from '../../api/customerService';

const UserList = ({ onAddNew, onEdit }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchOrganization, setSearchOrganization] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [organizations, setOrganizations] = useState([]);

    // Fetch organizations from API
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await customerService.getAllOrganizations({
                    page: 0,
                    size: 1000 // Get all organizations
                });
                if (response.code === 'SUCCESS') {
                    const items = Array.isArray(response.data?.content) ? response.data.content : [];
                    const flatList = items.map(org => ({
                        id: org.id,
                        name: org.name,
                        abbreviation: org.abbreviation || '',
                        code: org.code || '',
                        status: org.status,
                        parent_id: org.parentId !== undefined ? org.parentId : (org.parent_id !== undefined ? org.parent_id : null),
                        type: (org.parentId ?? org.parent_id ?? null) === null ? 'Tổ chức cha' : 'Tổ chức con'
                    }));
                    setOrganizations(flatList);
                }
            } catch (err) {
                console.error('Error fetching organizations:', err);
            }
        };
        fetchOrganizations();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const textSearch = (searchName || searchEmail || searchPhone || '').trim();
            const apiPage = Math.max(0, (currentPage || 0) - 1);
            const response = await customerService.getAllCustomers({
                textSearch,
                organizationId: selectedOrgId || '',
                page: apiPage,
                size: itemsPerPage
            });
            if (response.code === 'SUCCESS') {
                const { content = [], totalPages = 0, totalElements = 0 } = response.data || {};
                setUsers(content);
                setFilteredUsers(content);
                setTotalPages(totalPages);
                setTotalElements(totalElements);
            } else {
                setError(response.message || 'Không thể tải danh sách người dùng');
            }
        } catch (e) {
            setError(e.message || 'Đã xảy ra lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedOrgId]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginatedData = () => filteredUsers;

    const startItem = filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalElements);

    // Helper function to get organization name by ID
    const getOrganizationName = (organizationId) => {
        if (!organizationId) return 'N/A';
        const org = organizations.find(o => o.id === organizationId);
        return org ? org.name : 'N/A';
    };

    // Helper function to format roles
    const formatRoles = (roles) => {
        if (!roles || !Array.isArray(roles) || roles.length === 0) return 'N/A';
        return roles.map(role => role.name).join(', ');
    };

    // Helper function to format status
    const formatStatus = (status) => {
        if (status === 1) return 'Hoạt động';
        if (status === 0) return 'Không hoạt động';
        return status?.toString() || 'N/A';
    };

    return (
        <div className="user-management-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'baseline' }}>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <OrganizationDropDown
                        organizations={organizations}
                        value={selectedOrgId}
                        onChange={(org) => { setSelectedOrgId(org?.id ?? null); setSearchOrganization(org?.name ?? ''); }}
                        placeholder="Chọn tổ chức"
                    />
                </div>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <SearchBar placeholder="Địa chỉ email/Họ tên/Số điện thoại" value={searchName || searchEmail || searchPhone} onChange={(v) => { setSearchName(v); setSearchEmail(v); setSearchPhone(v); }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" onClick={handleSearch} />
                    <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={() => onAddNew ? onAddNew() : navigate('/main/form-user/add')} />
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Import file" icon={<span style={{fontWeight:700}}>☁️</span>} />
                </div>
            </div>

            <div className="template-link template-right">
                <span>Bạn chưa có file mẫu? </span>
                <a href="#!" className="template-download">Tải file mẫu</a>
            </div>

            <BaseTable
                columns={[
                    'Họ tên',
                    'Email',
                    'Số điện thoại',
                    'Tên tổ chức',
                    'Trạng thái',
                    'Vai trò',
                    'Hình thức đăng nhập',
                    'Quản lý'
                ]}
                data={getPaginatedData().map(user => ([
                    (<span 
                        key={`name-${user.id}`}
                        onClick={() => navigate(`/main/user-detail/${user.id}`)}
                        style={{ cursor: 'pointer', color: '#0B57D0' }}
                    >
                        {user.name || 'N/A'}
                    </span>),
                    user.email || 'N/A',
                    user.phone || 'N/A',
                    getOrganizationName(user.organizationId),
                    formatStatus(user.status),
                    formatRoles(user.roles),
                    user.loginMethod || 'N/A',
                    (<button 
                        key={`edit-${user.id}`} 
                        className="edit-btn" 
                        title="Chỉnh sửa" 
                        onClick={() => onEdit ? onEdit(user) : navigate(`/main/form-user/edit/${user.id}`)}
                    >
                        ✏️
                    </button>)
                ]))}
            />

            <div className="pagination-container">
                <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
                
                <div className="pagination-info">
                    Số lượng: {startItem} - {endItem} / {filteredUsers.length}
                </div>
            </div>
        </div>
    );
};

export default UserList;
