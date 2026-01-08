import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/dashboardService';
import '../../styles/createdDocumentsChart.css';

const CreatedDocumentsChart = () => {
    const [activeTab, setActiveTab] = useState('mine');
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-12-31');
    const [data, setData] = useState({ mine: [], org: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTab === 'mine') fetchMyDocuments();
        else fetchOrgDocuments();
    }, [activeTab, startDate, endDate]);

    const fetchMyDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await dashboardService.getMyContracts({ fromDate: startDate, toDate: endDate });
            const chartData = [
                { label: 'Đang xử lý', value: result.totalProcessing || 0, color: '#6DA9FF' },
                { label: 'Hoàn thành', value: result.totalSigned || 0, color: '#FFC980' },
                { label: 'Từ chối', value: result.totalReject || 0, color: '#9AA4B2' },
                { label: 'Hủy bỏ', value: result.totalCancel || 0, color: '#78E3C0' },
                { label: 'Quá hạn', value: result.totalExpires || 0, color: '#FF6B6B' },
            ];
            setData(prev => ({ ...prev, mine: chartData }));
        } catch (err) {
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
                fromDate: startDate,
                toDate: endDate,
                organizationId: 1,
            });
            console.log('📊 Response từ getContractsByOrganization:', result);

            // Kiểm tra nếu result là null hoặc undefined
            if (!result) {
                console.warn('⚠️ API trả về null hoặc undefined');
                setData(prev => ({ ...prev, org: [] }));
                return;
            }

            const chartData = [
                { label: 'Đang xử lý', value: result.totalProcessing || 0, color: '#6DA9FF' },
                { label: 'Hoàn thành', value: result.totalSigned || 0, color: '#FFC980' },
                { label: 'Từ chối', value: result.totalReject || 0, color: '#9AA4B2' },
                { label: 'Hủy bỏ', value: result.totalCancel || 0, color: '#78E3C0' },
                { label: 'Quá hạn', value: result.totalExpires || 0, color: '#FF6B6B' },
            ];
            setData(prev => ({ ...prev, org: chartData }));
        } catch (err) {
            console.error('❌ Lỗi fetchOrgDocuments:', err);
            setError(err.message || 'Không thể tải dữ liệu tài liệu tổ chức');
        } finally {
            setLoading(false);
        }
    };

    const current = data[activeTab];
    const maxVal = current.length > 0 ? Math.max(...current.map(d => d.value), 1) : 1;
    const isEmpty = current.every(d => d.value === 0);

    return (
        <div className="viChartCreated-container">
            <div className="viChartCreated-header">Tài liệu đã tạo</div>
            <div className="viChartCreated-toolbar">
                <div className="viChartCreated-tabs">
                    <button className={`viChartCreated-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>Tài liệu của tôi</button>
                    <button className={`viChartCreated-tab ${activeTab === 'org' ? 'active' : ''}`} onClick={() => setActiveTab('org')}>Tài liệu của tổ chức</button>
                </div>
                <div className="viChartCreated-date-range">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span className="date-sep">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>}
            {error && <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Lỗi: {error}</div>}

            {!loading && !error && (
                isEmpty ? <div style={{ textAlign: 'center', padding: '40px' }}>Không có dữ liệu</div> :
                    <div className="viChartCreated-bar-chart">
                        {current.map((d, idx) => (
                            <div key={idx} className="viChartCreated-bar-column">
                                <div className="viChartCreated-bar" style={{ height: `${(d.value / maxVal) * 160}px`, background: d.color }}>
                                    <span className="viChartCreated-bar-value">{d.value}</span>
                                </div>
                                <div className="viChartCreated-bar-label">{d.label}</div>
                            </div>
                        ))}
                    </div>
            )}
        </div>
    );
};

export default CreatedDocumentsChart;
