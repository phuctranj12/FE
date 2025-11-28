import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/dashboardService';
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

const ReceivedDocumentsStats = ({ title = 'Tài liệu đã nhận' }) => {
    const [stats, setStats] = useState({
        waiting: 0,
        waitingReply: 0,
        expiring: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReceivedDocuments();
    }, []);
    useEffect(() => {
        // console.log("STATS UPDATED:", stats);
    }, [stats]);


    const fetchReceivedDocuments = async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getReceivedDocuments();

            if (!result || !result.data) {
                throw new Error('API trả về dữ liệu trống');
            }

            const d = result.data;

            // console.log('Mapped stats:', {
            //     waiting: d.totalProcessing ?? 0,
            //     waitingReply: d.totalWaiting ?? 0,
            //     expiring: d.totalAboutExpire ?? 0,
            //     completed: d.totalSigned ?? 0,
            // });

            setStats({
                waiting: d.totalProcessing ?? 0,
                waitingReply: d.totalWaiting ?? 0,
                expiring: d.totalAboutExpire ?? 0,
                completed: d.totalSigned ?? 0,
            });
        } catch (err) {
            console.error('Error fetching received documents:', err);
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="received-stats-container">
                <div className="received-stats-header">{title}</div>
                <div className="received-stats-grid">
                    <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="received-stats-container">
                <div className="received-stats-header">{title}</div>
                <div className="received-stats-grid">
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        Lỗi: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="received-stats-container">
            <div className="received-stats-header">{title}</div>
            <div className="received-stats-grid">
                <StatCard value={stats.waiting} label="Chờ xử lý" dotColor="#1A73E8" />
                <StatCard value={stats.waitingReply} label="Chờ phản hồi" dotColor="#F4B400" />
                <StatCard value={stats.expiring} label="Sắp hết hạn" dotColor="#FB8C00" />
                <StatCard value={stats.completed} label="Hoàn thành" dotColor="#34A853" />
            </div>
        </div>

    );
};

export default ReceivedDocumentsStats;