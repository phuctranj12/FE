import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import Pagination from '../common/Pagination';
import OrganizationDropDown from '../common/OrganizationDropDown';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchOrganization, setSearchOrganization] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState(null);

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

    // Sample data
    useEffect(() => {
        const sampleData = [
            {
                id: 1,
                name: 'A1',
                email: 'hunhun28@yopmail.com',
                phone: '033654313',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 2,
                name: 'Admin',
                email: 'nguyendoha34@gmail.com',
                phone: '0934516891',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 3,
                name: 'AdminATus',
                email: 'atusadmin@gmail.com',
                phone: '0376242908',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 4,
                name: 'atessttuuuuu',
                email: 'test@example.com',
                phone: '0123456789',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Member',
                loginMethod: 'Số điện thoại'
            },
            {
                id: 5,
                name: 'A1',
                email: 'hunhun28@yopmail.com',
                phone: '033654313',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 6,
                name: 'Admin',
                email: 'nguyendoha34@gmail.com',
                phone: '0934516891',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 7,
                name: 'AdminATus',
                email: 'atusadmin@gmail.com',
                phone: '0376242908',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 8,
                name: 'atessttuuuuu',
                email: 'test@example.com',
                phone: '0123456789',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Member',
                loginMethod: 'Số điện thoại'
            },
            {
                id: 9,
                name: 'A1',
                email: 'hunhun28@yopmail.com',
                phone: '033654313',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 10,
                name: 'Admin',
                email: 'nguyendoha34@gmail.com',
                phone: '0934516891',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 11,
                name: 'AdminATus',
                email: 'atusadmin@gmail.com',
                phone: '0376242908',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 12,
                name: 'atessttuuuuu',
                email: 'test@example.com',
                phone: '0123456789',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Member',
                loginMethod: 'Số điện thoại'
            },
            {
                id: 13,
                name: 'A1',
                email: 'hunhun28@yopmail.com',
                phone: '033654313',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 14,
                name: 'Admin',
                email: 'nguyendoha34@gmail.com',
                phone: '0934516891',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 15,
                name: 'AdminATus',
                email: 'atusadmin@gmail.com',
                phone: '0376242908',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 16,
                name: 'atessttuuuuu',
                email: 'test@example.com',
                phone: '0123456789',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Member',
                loginMethod: 'Số điện thoại'
            },
            {
                id: 17,
                name: 'A1',
                email: 'hunhun28@yopmail.com',
                phone: '033654313',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 18,
                name: 'Admin',
                email: 'nguyendoha34@gmail.com',
                phone: '0934516891',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 19,
                name: 'AdminATus',
                email: 'atusadmin@gmail.com',
                phone: '0376242908',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Admin',
                loginMethod: 'Email'
            },
            {
                id: 20,
                name: 'atessttuuuuu',
                email: 'test@example.com',
                phone: '0123456789',
                organization: 'Trung tâm công nghệ thông tin MobiFone',
                status: 'Hoạt động',
                role: 'Member',
                loginMethod: 'Số điện thoại'
            }
        ];
        setUsers(sampleData);
        setFilteredUsers(sampleData);
    }, []);

    const handleSearch = () => {
        const filtered = users.filter(user => {
            const matchesName = searchName === '' || user.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesEmail = searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase());
            const matchesPhone = searchPhone === '' || user.phone.includes(searchPhone);
            const matchesOrg = searchOrganization === '' || user.organization.toLowerCase().includes(searchOrganization.toLowerCase());
            return matchesName && matchesEmail && matchesPhone && matchesOrg;
        });
        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredUsers.length);

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
                    <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" />
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
