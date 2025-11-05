import React from 'react';
import '../../styles/receivedDocumentsStats.css';

const StatCard = ({ value, label, dotColor = '#1A73E8' }) => {
    return (
        <div className="stat-card">
            <div className="stat-value">{value}</div>
            <div className="stat-label">
                <span className="stat-dot" style={{ backgroundColor: dotColor }} />
                <span>{label}</span>
            </div>
        </div>
    );
};

const ReceivedDocumentsStats = ({
    title = 'Tài liệu đã nhận',
    waiting = 112,
    waitingReply = 9,
    expiring = 0,
    completed = 979,
}) => {
    return (
        <div className="received-stats-container">
            <div className="received-stats-header">{title}</div>
            <div className="received-stats-grid">
                <StatCard value={waiting} label="Chờ xử lý" dotColor="#1A73E8" />
                <StatCard value={waitingReply} label="Chờ phản hồi" dotColor="#F4B400" />
                <StatCard value={expiring} label="Sắp hết hạn" dotColor="#FB8C00" />
                <StatCard value={completed} label="Hoàn thành" dotColor="#34A853" />
            </div>
        </div>
    );
};

export default ReceivedDocumentsStats;


