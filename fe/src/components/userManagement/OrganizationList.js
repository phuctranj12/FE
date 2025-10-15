import React, { useState, useEffect } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import AddOrganizationPanel from './AddOrganizationPanel';

const OrganizationList = () => {
    const [organizations, setOrganizations] = useState([]); // flat list from backend
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [searchName, setSearchName] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showAddPanel, setShowAddPanel] = useState(false);

    // Sample data (mô phỏng backend trả về dạng phẳng với parent_id)
    useEffect(() => {
        const flat = [
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
        ];
        setOrganizations(flat);
        setFilteredOrganizations(flat);
    }, []);

    const handleSearch = () => {
        const filtered = organizations.filter(org => {
            const matchesCode = searchCode === '' || org.code.toLowerCase().includes(searchCode.toLowerCase());
            const matchesName = searchName === '' || org.name.toLowerCase().includes(searchName.toLowerCase());
            return matchesCode && matchesName;
        });
        setFilteredOrganizations(filtered);
    };

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const statusLabel = (s) => (s === 1 ? 'Hoạt động' : 'Không hoạt động');

    const handleAddOrganization = (newOrgData) => {
        // Generate new ID
        const newId = Math.max(...organizations.map(o => o.id)) + 1;
        
        // Create new organization object
        const newOrg = {
            id: newId,
            name: newOrgData.name,
            abbreviation: newOrgData.abbreviation || '',
            code: newOrgData.code,
            status: newOrgData.status,
            parent_id: newOrgData.parentOrg,
            type: 'Tổ chức con'
        };
        
        // Add to organizations list
        const updatedOrgs = [...organizations, newOrg];
        setOrganizations(updatedOrgs);
        setFilteredOrganizations(updatedOrgs);
        
        console.log('Added new organization:', newOrg);
    };

    // Tạo map parent -> children cho dữ liệu phẳng
    const buildChildrenMap = (list) => {
        const map = new Map();
        list.forEach((o) => {
            const key = o.parent_id == null ? 'root' : String(o.parent_id);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(o);
        });
        return map;
    };

    return (
        <div className="user-management-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'baseline' }}>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <SearchBar placeholder="Nhập mã tổ chức" value={searchCode} onChange={setSearchCode} />
                </div>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <SearchBar placeholder="Nhập tên tổ chức" value={searchName} onChange={setSearchName} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" />
                    <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={() => setShowAddPanel(true)} />
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Import file" icon={<span style={{fontWeight:700}}>☁️</span>} />
                </div>
            </div>

            <div className="template-link template-right">
                <span>Bạn chưa có file mẫu? </span>
                <a href="#!" className="template-download">Tải file mẫu</a>
            </div>

            <BaseTable
                columns={["Tên tổ chức", "ID", "Mã tổ chức", "Trạng thái", "Loại tổ chức", "Quản lý"]}
                data={(function(){
                    const map = buildChildrenMap(filteredOrganizations);
                    const roots = map.get('root') || [];
                    const rows = [];

                    const addRows = (node, depth = 0) => {
                        const hasChildren = (map.get(String(node.id)) || []).length > 0;
                        rows.push([
                            (<>
                                <span className="tree-indent" style={{ ['--indent']: `${depth * 24}px` }} />
                                {hasChildren && (
                                    <button className="expand-btn" onClick={() => toggleExpand(node.id)}>
                                        {expandedRows.has(node.id) ? '▼' : '▶'}
                                    </button>
                                )}
                                <span className="tree-name">{node.name}</span>
                            </>),
                            node.id,
                            node.code,
                            statusLabel(node.status),
                            node.type,
                            (<button className="edit-btn" title="Chỉnh sửa">✏️</button>)
                        ]);

                        if (expandedRows.has(node.id)) {
                            const children = map.get(String(node.id)) || [];
                            children.forEach((child) => addRows(child, depth + 1));
                        }
                    };

                    roots.forEach((root) => addRows(root, 0));
                    return rows;
                })()}
            />
            
            {showAddPanel && (
                <AddOrganizationPanel 
                    onClose={() => setShowAddPanel(false)}
                    onSave={handleAddOrganization}
                    organizations={organizations}
                />
            )}
        </div>
    );
};

export default OrganizationList;
