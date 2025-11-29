import React, { useRef, useState } from 'react';
import documentService from '../../api/documentService';
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
            const response = await documentService.verifySignature(file);

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

    // Hàm parse thông tin từ signer/issuer string
    const parseCertificateInfo = (certString) => {
        if (!certString) return { name: '', organization: '' };
        
        // Parse từ format: "C=VN,ST=Ha Noi,L=Quan Cau Giay,O=MobiFone IT,UID=MST:0100686209-199,UID=CCCD:025199009534,CN=NGUYEN HONG NHUNG"
        const parts = certString.split(',');
        let name = '';
        let organization = '';
        
        parts.forEach(part => {
            const [key, ...valueParts] = part.split('=');
            const value = valueParts.join('=');
            
            if (key === 'CN') {
                name = value;
            } else if (key === 'O') {
                organization = value;
            }
        });
        
        return { name, organization };
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const renderResult = () => {
        if (!result) {
            return <p>Chưa có kết quả kiểm tra.</p>;
        }

        // Trường hợp không có chữ ký số
        if (result.status === false || !result.signatures || result.signatures.length === 0) {
            return (
                <div>
                    <p>
                        <strong>{result.message || 'PDF không có chữ ký số'}</strong>
                    </p>
                </div>
            );
        }

        // Trường hợp có chữ ký số
        if (result.signatures && result.signatures.length > 0) {
            return (
                <div>
                    <p style={{ marginBottom: '16px', fontWeight: '500' }}>
                        <strong>File có {result.signatures.length} chữ ký số</strong>
                    </p>
                    <table className="signature-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên người ký</th>
                                <th>Thời gian ký</th>
                                <th>Thời gian hiệu lực của chứng thư số</th>
                                <th>Đơn vị cấp chứng thư số</th>
                                <th>Ký trong thời gian hợp lệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.signatures.map((signature, index) => {
                                const signerInfo = parseCertificateInfo(signature.signer);
                                const issuerInfo = parseCertificateInfo(signature.issuer);
                                
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{signerInfo.name || '-'}</td>
                                        <td>{formatDate(signature.signDate)}</td>
                                        <td>
                                            {formatDate(signature.notBefore)} - {formatDate(signature.notAfter)}
                                        </td>
                                        <td>{issuerInfo.organization || '-'}</td>
                                        <td>
                                            <span className={signature.certificateValid ? 'valid-badge' : 'invalid-badge'}>
                                                {signature.certificateValid ? 'Có' : 'Không'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        return <p>Không có thông tin chữ ký số.</p>;
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


