import React from 'react';
import '../../styles/dashboardLayout.css';

const DocItem = ({
    title,
    party = 'Trung tâm công nghệ thông tin MobiFone',
    tag = 'Ký số bằng HSM',
    date = '20/10/2025 00:18:23',
}) => {
    return (
        <div className="doc-item">
            <div className="doc-left">
                <div className="doc-icon" aria-hidden>
                    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 2h14l6 6v24a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#5B9EFF" strokeWidth="1.5" fill="#F3F8FF"/>
                        <path d="M18 2v6h6" stroke="#5B9EFF" strokeWidth="1.5"/>
                        <path d="M8 16h12M8 20h12M8 24h8" stroke="#8FB6FF" strokeWidth="1.5" strokeLinecap="round"/>
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
    const handleViewAll = () => {
        // TODO: Navigate to the full list page
        // window.location.href = '/main/document';
    };

    return (
        <div className="right-summary-panel">
            <div className="right-summary-header">
                <span className="right-summary-title">Yêu cầu cần xử lý</span>
                <button className="right-summary-link" onClick={handleViewAll}>Xem tất cả</button>
            </div>
            <div className="right-summary-content">
                <div className="doc-list">
                    <DocItem title="Kí test hsm" />
                    <DocItem title="Hợp đồng dịch vụ ABC" date="19/10/2025 15:20:01" />
                    <DocItem title="Phụ lục hợp đồng DEF" date="18/10/2025 09:05:12" />
                    <DocItem title="Phụ lục hợp đồng DEF" date="18/10/2025 09:05:12" />
                </div>
            </div>
        </div>
    );
};

export default RightSummaryPanel;


