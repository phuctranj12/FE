import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import OrganizationDropDown from '../common/OrganizationDropDown';
import customerService from '../../api/customerService';

const UserList = ({ onAddNew }) => {
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

    // Sample organizations (flat with parent_id) for dropdown demo
    const organizations = useMemo(() => ([
        { id: 226, name: 'Trung tâm công nghệ thông tin MobiFone', abbreviation: 'TT.CNTT MBF1', code: 'TTCNTT', status: 1, parent_id: null, type: 'Tổ chức cha' },
        { id: 1215, name: 'TC230301', abbreviation: 'TC230301', code: 'TC230301', status: 1, parent_id: 226, type: 'Tổ chức con' },
        { id: 1216, name: 'haitest1231', abbreviation: 'haitest', code: '', status: 1, parent_id: 226, type: 'Tổ chức con' },
        { id: 1242, name: 'Công ty Dịch vụ MobiFone Khu vực 8', abbreviation: 'MBF8', code: 'MBF8', status: 1, parent_id: 226, type: 'Tổ chức con' },
        { id: 1288, name: 'CÔNG TY DỊCH VỤ MOBIFONE KHU VỰC 9', abbreviation: 'CTKV9', code: '', status: 1, parent_id: 226, type: 'Tổ chức con' },
        { id: 1849, name: 'Thêm mới tên TC 01', abbreviation: '123456', code: '123456', status: 0, parent_id: 226, type: 'Tổ chức con' },
        { id: 1850, name: 'Thêm mới tên TC 02', abbreviation: '123', code: '123', status: 0, parent_id: 226, type: 'Tổ chức con' },
        // cấp 2 (con của 1215)
        { id: 3001, name: 'Phòng Kinh doanh', abbreviation: 'PKD', code: 'PKD01', status: 1, parent_id: 1215, type: 'Tổ chức con' },
        { id: 3002, name: 'Phòng Kỹ thuật', abbreviation: 'PKT', code: 'PKT01', status: 1, parent_id: 1215, type: 'Tổ chức con' },
        // cấp 3 (con của 3001)
        { id: 4001, name: 'Tổ Bán hàng 1', abbreviation: 'TBH1', code: 'BH1', status: 1, parent_id: 3001, type: 'Tổ chức con' },
        { id: 4002, name: 'Tổ Bán hàng 2', abbreviation: 'TBH2', code: 'BH2', status: 1, parent_id: 3001, type: 'Tổ chức con' },
    ]), []);

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
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" />
                    <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={onAddNew} />
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
                    user.name,
                    user.email,
                    user.phone,
                    user.organization,
                    user.status,
                    user.role,
                    user.loginMethod,
                    (<button key={`edit-${user.id}`} className="edit-btn" title="Chỉnh sửa">✏️</button>)
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
