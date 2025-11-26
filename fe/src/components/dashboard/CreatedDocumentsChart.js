import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/dashboardService';
import '../../styles/createdDocumentsChart.css';

const CreatedDocumentsChart = () => {
    const [activeTab, setActiveTab] = useState('mine');
    const [startDate, setStartDate] = useState('2025-10-04');
    const [endDate, setEndDate] = useState('2025-11-03');
    const [organizationId, setOrganizationId] = useState(null);
    const [data, setData] = useState({
        mine: [],
        org: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Lấy organizationId từ localStorage nếu có
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.organizationId) {
                    setOrganizationId(userData.organizationId);
                }
            } catch (err) {
                console.error('Error parsing user data:', err);
            }
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'mine') {
            fetchMyDocuments();
        } else if (activeTab === 'org' && organizationId) {
            fetchOrgDocuments();
        }
    }, [activeTab, startDate, endDate, organizationId]);

    const fetchMyDocuments = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardService.getMyContracts({
                fromDate: startDate || null,
                toDate: endDate || null,
            });

            if (result.code === 'SUCCESS' && result.data) {
                const chartData = [
                    { label: 'Đang xử lý', value: result.data.totalProcessing || 0, color: '#6DA9FF' },
                    { label: 'Hoàn thành', value: result.data.totalSigned || 0, color: '#FFC980' },
                    { label: 'Từ chối', value: result.data.totalReject || 0, color: '#9AA4B2' },
                    { label: 'Hủy bỏ', value: result.data.totalCancel || 0, color: '#78E3C0' },
                    { label: 'Quá hạn', value: result.data.totalExpires || 0, color: '#FF6B6B' },
                ];
                setData(prev => ({ ...prev, mine: chartData }));
            }
        } catch (err) {
            console.error('Error fetching my documents:', err);
            setError(err.message || 'Không thể tải dữ liệu tài liệu của tôi');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgDocuments = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardService.getContractsByOrganization({
                fromDate: startDate || null,
                toDate: endDate || null,
                organizationId: organizationId || null,
            });

            if (result.code === 'SUCCESS' && result.data) {
                const chartData = [
                    { label: 'Đang xử lý', value: result.data.totalProcessing || 0, color: '#6DA9FF' },
                    { label: 'Hoàn thành', value: result.data.totalSigned || 0, color: '#FFC980' },
                    { label: 'Từ chối', value: result.data.totalReject || 0, color: '#9AA4B2' },
                    { label: 'Hủy bỏ', value: result.data.totalCancel || 0, color: '#78E3C0' },
                    { label: 'Quá hạn', value: result.data.totalExpires || 0, color: '#FF6B6B' },
                ];
                setData(prev => ({ ...prev, org: chartData }));
            }
        } catch (err) {
            console.error('Error fetching org documents:', err);
            setError(err.message || 'Không thể tải dữ liệu tài liệu tổ chức');
        } finally {
            setLoading(false);
        }
    };

    const current = data[activeTab];
    const maxVal = current.length > 0 ? Math.max(...current.map(d => d.value), 1) : 1;

    return (
        <div className="created-chart-container">
            <div className="created-chart-header">Tài liệu đã tạo</div>
            <div className="created-chart-toolbar">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >Tài liệu của tôi</button>
                    <button
                        className={`tab ${activeTab === 'org' ? 'active' : ''}`}
                        onClick={() => setActiveTab('org')}
                        disabled={!organizationId}
                    >Tài liệu của tổ chức</button>
                </div>
                <div className="date-range">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="date-sep">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    Đang tải...
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                    Lỗi: {error}
                </div>
            )}

            {!loading && !error && (
                <div className="bar-chart">
                    {current.map((d, idx) => (
                        <div key={idx} className="bar-column">
                            <div className="bar" style={{ height: `${(d.value / maxVal) * 160}px`, background: d.color }}>
                                <span className="bar-value">{d.value}</span>
                            </div>
                            <div className="bar-label">{d.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatedDocumentsChart;