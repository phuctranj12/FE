import React, { useState, useEffect } from 'react';
import '../../styles/userManagement.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import BaseTable from '../common/BaseTable';
import AddOrganizationPanel from './AddOrganizationPanel';
import customerService from '../../api/customerService';

const OrganizationList = () => {
    const [organizations, setOrganizations] = useState([]); // flat list from backend
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [searchName, setSearchName] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch organizations from API
    const fetchOrganizations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerService.getAllOrganizations({
                page: 1,
                size: 1000 // Get all organizations
            });
            
            if (response.code === 'SUCCESS') {
                // Transform nested structure to flat structure with parent_id
                const flatList = flattenOrganizations(response.data.content);
                setOrganizations(flatList);
                setFilteredOrganizations(flatList);
            } else {
                setError(response.message || 'Failed to fetch organizations');
            }
        } catch (err) {
            console.error('Error fetching organizations:', err);
            setError('Không thể tải danh sách tổ chức. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Convert nested structure to flat structure with parent_id
    const flattenOrganizations = (orgs, parentId = null) => {
        let flatList = [];
        orgs.forEach(org => {
            const flatOrg = {
                id: org.id,
                name: org.name,
                abbreviation: org.abbreviation || '',
                code: org.code || '',
                status: org.status,
                parent_id: parentId,
                type: parentId === null ? 'Tổ chức cha' : 'Tổ chức con'
            };
            flatList.push(flatOrg);
            
            // Recursively flatten children
            if (org.children && org.children.length > 0) {
                const children = flattenOrganizations(org.children, org.id);
                flatList = flatList.concat(children);
            }
        });
        return flatList;
    };

    useEffect(() => {
        fetchOrganizations();
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

    const handleAddOrganization = async (newOrgData) => {
        try {
            // Build the organization data object with conditional parentId
            const orgData = {
                name: newOrgData.name,
                email: newOrgData.email || '',
                taxCode: newOrgData.taxId || '', // Map taxId to taxCode
                code: newOrgData.code,
                ...(newOrgData.parentOrg && { parentId: newOrgData.parentOrg })
            };
            
            console.log('Sending organization data:', orgData);
            
            const response = await customerService.createOrganization(orgData);
            
            console.log('Full API response:', response);
            
            if (response.code === 'SUCCESS') {
                // Refresh the list after successful creation
                await fetchOrganizations();
                setShowAddPanel(false);
                console.log('Added new organization:', response.data);
                alert('Thêm tổ chức thành công!');
            } else {
                console.error('Failed to add organization:', response);
                alert('Không thể thêm tổ chức mới: ' + (response.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error adding organization:', err);
            // Log detailed error information
            if (err.response) {
                console.error('Error response:', err.response);
                console.error('Error status:', err.response.status);
                console.error('Error data:', err.response.data);
            }
            
            const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi thêm tổ chức mới.';
            alert('Lỗi: ' + errorMessage);
        }
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
                    <SearchBar 
                        placeholder="Nhập mã tổ chức" 
                        value={searchCode} 
                        onChange={setSearchCode}
                    />
                </div>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <SearchBar 
                        placeholder="Nhập tên tổ chức" 
                        value={searchName} 
                        onChange={setSearchName}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Tìm kiếm" onClick={handleSearch} />
                    <Button outlineColor="#0B57D0" backgroundColor="#0B57D0" text="Thêm mới" onClick={() => setShowAddPanel(true)} />
                    <Button outlineColor="#0B57D0" backgroundColor="transparent" text="Import file" icon={<span style={{fontWeight:700}}>☁️</span>} />
                </div>
            </div>

            <div className="template-link template-right">
                <span>Bạn chưa có file mẫu? </span>
                <a href="#!" className="template-download">Tải file mẫu</a>
            </div>

            {loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                    <p>{error}</p>
                    <button onClick={fetchOrganizations} style={{ marginTop: '10px', padding: '8px 16px' }}>
                        Thử lại
                    </button>
                </div>
            )}

            {!loading && !error && (
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
            )}
            
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
