import React, { useRef, useState } from 'react';
import contractService from '../../api/contractService';
import '../../styles/checkSignDigital.css';

function CheckSignDigital() {
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleSelectFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setResult(null);
        setError('');

        try {
            setChecking(true);
            const response = await contractService.checkSignature(file);

            if (response?.code === 'SUCCESS') {
                setResult(response.data || {});
            } else {
                setError(response?.message || 'Không thể kiểm tra chữ ký số.');
            }
        } catch (err) {
            console.error('Error checking digital signature:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Có lỗi xảy ra khi kiểm tra chữ ký số.'
            );
        } finally {
            setChecking(false);
        }
    };

    const renderResult = () => {
        if (!result) {
            return <p>Chưa có kết quả kiểm tra.</p>;
        }

        // Tùy vào cấu trúc data backend trả về, bạn có thể hiển thị chi tiết hơn
        const hasSignature = result.hasSignature ?? result.valid ?? false;

        return (
            <div>
                <p>
                    Kết quả: <strong>{hasSignature ? 'File có chữ ký số hợp lệ' : 'File không có chữ ký số hoặc không hợp lệ'}</strong>
                </p>
                {result.message && <p>Chi tiết: {result.message}</p>}
            </div>
        );
    };

    return (
        <div className="check-sign-digital-page">
            <h2>Kiểm tra chữ ký số trong tài liệu</h2>

            <div className="check-sign-digital-content">
                <div className="file-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <button
                        className="check-btn primary-upload-btn"
                        onClick={handleSelectFileClick}
                        disabled={checking}
                    >
                        {checking ? 'Đang kiểm tra...' : 'Tải lên file ký số'}
                    </button>
                    {error && <p className="error-text">{error}</p>}
                </div>

                <div className="result-section">
                    <label className="result-label">Kết quả kiểm tra</label>
                    <div className="result-box">
                        {renderResult()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckSignDigital;


