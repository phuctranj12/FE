import React, { useState, useEffect } from 'react';
import createdDocumentService from '../../api/createdDocumentService';
import '../../styles/dashboardLayout.css';
import OrganizationService from '../../api/OrganizationService';
const DocItem = ({
    title,
    party = 'Trung tâm công nghệ thông tin eContract',
    tag = 'Ký số bằng HSM',
    date = '20/10/2025 00:18:23',
}) => {
    return (
        <div className="doc-item">
            <div className="doc-left">
                <div className="doc-icon" aria-hidden>
                    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 2h14l6 6v24a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#5B9EFF" strokeWidth="1.5" fill="#F3F8FF" />
                        <path d="M18 2v6h6" stroke="#5B9EFF" strokeWidth="1.5" />
                        <path d="M8 16h12M8 20h12M8 24h8" stroke="#8FB6FF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="doc-info">
                    <div className="doc-title">{title}</div>
                    <div className="doc-party">Bên A : {party}</div>
                    <div className="doc-tag">
                        <span className="tag-dot" />
                        <span className="tag-text">{tag}</span>
                    </div>
                </div>
            </div>
            <div className="doc-right">
                <span className="doc-date-icon" aria-hidden>📅</span>
                <span className="doc-date-text">{date}</span>
            </div>
        </div>
    );
};

const RightSummaryPanel = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [organizationMap, setOrganizationMap] = useState({});

    useEffect(() => {
        fetchWaitProcessingContracts();
    }, []);

    const fetchWaitProcessingContracts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Gọi API lấy danh sách hợp đồng chờ xử lý
            // Chỉ lấy 4 hợp đồng đầu tiên để hiển thị
            const response = await createdDocumentService.getWaitProcessingContracts({
                page: 0,
                size: 4,
            });

            console.log('🚀 Dữ liệu hợp đồng chờ xử lý:', response);

            // Kiểm tra response structure
            if (response?.data?.code === 'SUCCESS' && response?.data?.data?.content) {
                const docs = response.data.data.content;
                setDocuments(docs);
                loadOrganizations(docs);
            } else if (response?.code === 'SUCCESS' && response?.data?.content) {
                setDocuments(response.data.content);
            } else if (Array.isArray(response?.data)) {
                setDocuments(response.data);
            } else {
                console.warn('⚠️ Cấu trúc response không như mong đợi:', response);
                setDocuments([]);
            }
        } catch (err) {
            console.error('❌ Lỗi khi lấy hợp đồng chờ xử lý:', err);
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAll = () => {
        // Navigate to the full list page
        window.location.href = '/main/contract/receive/wait-processing';
    };

    // Format date từ timestamp hoặc string
    const formatDate = (dateString) => {
        if (!dateString) return '20/10/2025 00:18:23';

        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            return dateString;
        }
    };

    // Xác định tag dựa trên loại ký
    const getSignTag = (contract) => {
        // Có thể customize logic này dựa trên data structure thực tế
        if (contract?.signType === 'HSM') return 'Ký số bằng HSM';
        if (contract?.signType === 'USB_TOKEN') return 'Ký số bằng USB Token';
        if (contract?.signType === 'REMOTE') return 'Ký số từ xa';
        return 'Ký số bằng HSM'; // Default
    };
    const loadOrganizations = async (docs) => {
        const ids = [...new Set(
            docs
                .map(d => d.organizationId)
                .filter(Boolean)
        )];

        const newMap = {};

        await Promise.all(
            ids.map(async (id) => {
                try {
                    const res = await OrganizationService.getById(id);
                    if (res?.data?.code === 'SUCCESS') {
                        newMap[id] = res.data.data.name;
                    }
                } catch (e) {
                    console.warn(`Không load được organization ${id}`);
                }
            })
        );

        setOrganizationMap(prev => ({ ...prev, ...newMap }));
    };
    const getOrganizationDisplay = (doc) => {
        if (!doc?.organizationId) return 'Chưa có tổ chức';
        return organizationMap[doc.organizationId] || `ID: ${doc.organizationId}`;
    };





    return (
        <div className="right-summary-panel">
            <div className="right-summary-header">
                <span className="right-summary-title">Yêu cầu cần xử lý</span>
                <button className="right-summary-link" onClick={handleViewAll}>Xem tất cả</button>
            </div>
            <div className="right-summary-content">
                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        Đang tải...
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        Lỗi: {error}
                    </div>
                )}

                {!loading && !error && documents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        Không có tài liệu cần xử lý
                    </div>
                )}

                {!loading && !error && documents.length > 0 && (
                    <div className="doc-list">
                        {documents.map((doc, index) => (
                            <DocItem
                                key={doc.id || index}
                                title={doc.name || doc.title || 'Tài liệu không có tên'}
                                party={getOrganizationDisplay(doc)}
                                // tag={getSignTag(doc)}
                                date={formatDate(doc.createdAt)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSummaryPanel;