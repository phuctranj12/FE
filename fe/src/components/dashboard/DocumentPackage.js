import React, { useState, useEffect } from 'react';
import '../../styles/documentPackage.css';
import dashboardService from '../../api/dashboardService';

const DocumentPackage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const responseData = await dashboardService.getCustomerUserMaxContracts();

                const rawList = Array.isArray(responseData)
                    ? responseData
                    : Array.isArray(responseData?.data)
                        ? responseData.data
                        : [];

                const mappedUsers = rawList
                    .slice(0, 10)
                    .map((item, index) => ({
                        name:
                            item.fullName ||
                            item.customerName ||
                            item.name ||
                            `User ${index + 1}`,
                        count:
                            item.totalContract ||
                            item.totalContracts ||
                            item.count ||
                            0,
                    }))
                    .filter(u => u.count > 0);

                setUsers(mappedUsers);
            } catch (err) {
                console.error('Lỗi khi gọi API top user:', err);
                setError('Không thể tải dữ liệu người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchTopUsers();
    }, []);

    const maxCount = users.length > 0 ? Math.max(...users.map(u => u.count)) : 1;
    const colors = [
        '#0B57D0', // blue
        '#34A853', // green
        '#FBBC05', // yellow
        '#EA4335', // red
        '#9C27B0', // purple
        '#00ACC1', // cyan
        '#F57C00', // orange
        '#7CB342', // light green
        '#8E24AA', // deep purple
        '#546E7A', // blue gray
    ];

    return (
        <div className="document-package-container">
            <div className="document-package-header">
                <h3 className="document-package-title">Thống kê người dùng nhiều hợp đồng nhất</h3>
            </div>

            <div className="document-package-content">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>
                        Đang tải...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '20px', width: '100%', color: 'red' }}>
                        {error}
                    </div>
                ) : users.length === 0 ? (
                    <div className="bar-chart-empty">Chưa có dữ liệu</div>
                ) : (
                    <div className="bar-chart-wrapper">
                        {users.map((user, index) => {
                            const barWidth = maxCount > 0 ? (user.count / maxCount) * 100 : 0;
                            const color = colors[index % colors.length];
                            return (
                                <div key={index} className="bar-chart-row">
                                    <div className="bar-chart-name">{user.name}</div>
                                    <div className="bar-chart-bar-container">
                                        <div
                                            className="bar-chart-bar"
                                            style={{ width: `${barWidth}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                    <div className="bar-chart-value">{user.count}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentPackage;
