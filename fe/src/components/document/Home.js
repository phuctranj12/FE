import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeBanner from '../dashboard/WelcomeBanner';
import ReceivedDocumentsStats from '../dashboard/ReceivedDocumentsStats';
import RightSummaryPanel from '../dashboard/RightSummaryPanel';
import CreatedDocumentsChart from '../dashboard/CreatedDocumentsChart';
import '../../styles/dashboardLayout.css';

function HomeComponent() {
    const navigate = useNavigate();

    const handleDraftClick = () => {
        // Navigate to create document page (bản nháp/draft)
        // Có thể thay đổi route này nếu có route riêng cho bản nháp
        // navigate('/drafts') hoặc setMenuStatus('create-document')
        window.location.hash = '#create-document';
        // Hoặc nếu có route: navigate('/create-document');
    };

    // Lấy tên user từ localStorage hoặc context (nếu có)
    const getUserName = () => {
        // Có thể lấy từ user context hoặc localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.name || 'UserName';
            } catch {
                return 'User';
            }
        }
        return 'UserName';
    };

    return (
        <div className="home-content">
            {/* Row 1: Right panel matches height of WelcomeBanner + ReceivedDocumentsStats */}
            <div className="dashboard-row">
                <div className="dashboard-left">
                    <WelcomeBanner 
                        userName={getUserName()} 
                        onDraftClick={handleDraftClick}
                    />
                    <ReceivedDocumentsStats />
                </div>
                <div className="dashboard-right">
                    <RightSummaryPanel />
                </div>
            </div>

            {/* Row 2: Chart below, same width as left column components */}
            <CreatedDocumentsChart />
        </div>
    );
}

export default HomeComponent;