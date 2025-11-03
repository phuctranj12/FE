import React, { useState } from 'react';
import '../../styles/createdDocumentsChart.css';

const CreatedDocumentsChart = () => {
    const [activeTab, setActiveTab] = useState('mine');
    const [startDate, setStartDate] = useState('2025-10-04');
    const [endDate, setEndDate] = useState('2025-11-03');
    const data = {
        mine: [
            { label: 'Đang xử lý', value: 5, color: '#6DA9FF' },
            { label: 'Hoàn thành', value: 1, color: '#FFC980' },
            { label: 'Từ chối', value: 0, color: '#9AA4B2' },
            { label: 'Hủy bỏ', value: 1, color: '#78E3C0' },
            { label: 'Quá hạn', value: 1, color: '#9AA4B2' },
        ],
        org: [
            { label: 'Đang xử lý', value: 3, color: '#6DA9FF' },
            { label: 'Hoàn thành', value: 4, color: '#FFC980' },
            { label: 'Từ chối', value: 1, color: '#9AA4B2' },
            { label: 'Hủy bỏ', value: 0, color: '#78E3C0' },
            { label: 'Quá hạn', value: 2, color: '#9AA4B2' },
        ]
    };

    const current = data[activeTab];
    const maxVal = Math.max(...current.map(d => d.value), 1);

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
        </div>
    );
};

export default CreatedDocumentsChart;


