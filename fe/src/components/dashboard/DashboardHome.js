import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeBanner from './WelcomeBanner';
import ReceivedDocumentsStats from './ReceivedDocumentsStats';
import RightSummaryPanel from './RightSummaryPanel';
import CreatedDocumentsChart from './CreatedDocumentsChart';
import DocumentPackage from './DocumentPackage';
import '../../styles/dashboardLayout.css';

function DashboardHome() {
    const navigate = useNavigate();

    const handleDraftClick = () => {
        window.location.hash = '#create-document';
    };

    const getUserName = () => {
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
            <div className="dashboard-row">
                <div className="dashboard-left">
                    <WelcomeBanner 
                        userName={getUserName()} 
                        onDraftClick={handleDraftClick}
                    />
                    <ReceivedDocumentsStats />
                    <CreatedDocumentsChart />
                </div>
                <div className="dashboard-right">
                    <RightSummaryPanel />
                    <DocumentPackage />
                </div>
            </div>
        </div>
    );
}

export default DashboardHome;


