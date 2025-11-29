import React, { useEffect } from 'react';
import '../../styles/welcomeBanner.css';
import customerService from '../../api/customerService';
const WelcomeBanner = ({ userName = 'Nguyễn Quang Minh', onDraftClick }) => {
    const [user_name, setUsername] = React.useState(userName);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const respone = await customerService.getCustomerByToken(token);
                // console.log('Thông tin người dùng:', respone);
                setUsername(respone.data.name);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
            }
        };
        fetchUserData();
    }, []);
    return (
        <div className="welcome-banner">
            <div className="welcome-content">
                <h2 className="welcome-greeting">Xin chào, {user_name}</h2>
                <p className="welcome-message">
                    Nếu bạn đang có tài liệu đang soạn, hãy tiếp tục hoàn thành để quá trình ký không bị chậm trễ!
                </p>
                <button className="draft-button" onClick={onDraftClick}>
                    Bản nháp
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '8px' }}>
                        <path d="M11.3333 2L14 4.66667L5.33333 13.3333H2.66667V10.6667L11.3333 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div className="welcome-graphic">
                <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10 60 Q30 20, 50 40 T90 30 Q110 10, 130 50 T170 35 Q190 15, 190 60"
                        stroke="white"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default WelcomeBanner;

