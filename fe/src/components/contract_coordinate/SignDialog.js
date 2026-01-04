import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import contractService from '../../api/contractService';
import '../../styles/signDialog.css';

function SignDialog({ 
    open, 
    onClose, 
    contractId, 
    recipientId,
    fields = [],
    recipient,
    textFieldValues = {}, // Nhận từ parent
    onSigned 
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bước hiện tại: 1 = Chọn ảnh, 2 = Chọn chứng thư số
    const [step, setStep] = useState(1);

    // Kiểm tra role: role 4 = Văn thư, role 3 = Người ký
    const isClerk = recipient?.role === 4;
    const step1Title = isClerk ? 'Đóng Dấu Tài Liệu' : 'Ký Chứng Thư Số';
    const step2Title = isClerk ? 'Chọn Chứng Thư Số' : 'Chọn Chứng Thư Số';

    // State cho lựa chọn ảnh đóng dấu
    const [stampOption, setStampOption] = useState('none'); // 'none' | 'upload'
    const [imageBase64, setImageBase64] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // State cho chứng thư số (luôn đảm bảo là mảng)
    const [certificates, setCertificates] = useState([]);
    const [selectedCertId, setSelectedCertId] = useState('');

    // State cho validation
    const [errors, setErrors] = useState({});

    // Filter text fields và contract number fields được assign cho recipient này
    const textFields = fields.filter(field => 
        (field.type === 1 || field.type === 4) && 
        field.recipientId === recipientId
    );

    // Helper: tách base64 thuần từ data URL (bỏ prefix data:image/...;base64,)
    function extractBase64FromDataURL(dataURL) {
        if (!dataURL) return null;
        // Nếu đã là base64 thuần (không có prefix), trả về luôn
        if (!dataURL.includes(',')) return dataURL;
        // Tách phần base64 sau dấu phẩy
        const base64Part = dataURL.split(',')[1];
        return base64Part || null;
    }

    // Helper function to convert text to base64 (with UTF-8 support)
    const encodeToBase64 = (text) => {
        if (!text) return '';
        try {
            // Encode UTF-8 string to base64
            return btoa(unescape(encodeURIComponent(text)));
        } catch (err) {
            console.warn('Error encoding to base64:', err);
            return text; // Fallback to original text if encoding fails
        }
    };

    // Helper function to convert text to image base64
    const convertTextToImageBase64 = (text, field) => {
        return new Promise((resolve, reject) => {
            try {
                // Tạo canvas để render text thành image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Lấy thông tin font từ field
                const fontSize = field.fontSize || 13;
                const fontFamily = field.font || 'Times New Roman';
                const boxW = field.boxW || 200;
                const boxH = field.boxH || 30;
                
                // Set canvas size
                canvas.width = boxW;
                canvas.height = boxH;
                
                // Set background (transparent hoặc white)
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Set text style
                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = 'black';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                
                // Draw text
                const textY = canvas.height / 2;
                ctx.fillText(text, 5, textY);
                
                // Convert canvas to base64 (without data:image/png;base64, prefix)
                const dataURL = canvas.toDataURL('image/png');
                const base64 = extractBase64FromDataURL(dataURL);
                
                resolve(base64);
            } catch (err) {
                console.error('Error converting text to image:', err);
                reject(err);
            }
        });
    };

    // Reset state khi mở / đóng dialog
    useEffect(() => {
        if (open) {
            setStep(1);
            setStampOption('none');
            setImageBase64(null);
            setAcceptTerms(false);
            setCertificates([]);
            setSelectedCertId('');
            setError(null);
            setErrors({});
        }
    }, [open]);

    // Reset ảnh khi chọn option "none"
    useEffect(() => {
        if (stampOption === 'none') {
            setImageBase64(null);
        }
    }, [stampOption]);

    // Filter fields: chỉ lấy field type = 3 (DIGITAL_SIGN) và status = 0 (chưa ký) và thuộc về recipient này
    const availableFields = fields.filter(field => 
        field.type === 3 && 
        field.status === 0 && 
        field.recipientId === recipientId
    );

    const loadCertificates = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await contractService.getCertByUser();
            
            if (response?.code === 'SUCCESS') {
                const raw = response.data;
                const list = raw?.certificates;
                const certs = Array.isArray(list) ? list : (list ? [list] : []);
                setCertificates(certs);
                
                // Auto select first certificate nếu có
                if (certs.length > 0) {
                    setSelectedCertId(certs[0].id?.toString());
                }
            } else {
                throw new Error(response?.message || 'Không thể tải danh sách chứng thư số');
            }
        } catch (err) {
            console.error('Error loading certificates:', err);
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải chứng thư số');
        } finally {
            setLoading(false);
        }
    };

    // Helper: tách MST từ chuỗi certInformation (UID=MST:xxxx)
    function extractTaxCode(certInformation) {
        if (!certInformation) return '';
        const match = certInformation.match(/UID=MST:([^,]+)/);
        return match ? match[1].trim() : '';
    }

    // Helper: tách tên chủ thể từ certInformation (CN=TEN, ...)
    function extractSubjectName(certInformation) {
        if (!certInformation) return '';
        const match = certInformation.match(/CN=([^,]+)/);
        return match ? match[1].trim() : certInformation;
    }

    // Helper: tách MST và CCCD từ certInformation
    function extractIdsFromCert(certInformation) {
        if (!certInformation) return { taxCode: '', cccd: '' };
        const mstMatch = certInformation.match(/UID=MST:([^,]+)/);
        const cccdMatch = certInformation.match(/UID=CCCD:([^,]+)/);
        return {
            taxCode: mstMatch ? mstMatch[1].trim() : '',
            cccd: cccdMatch ? cccdMatch[1].trim() : ''
        };
    }

    const handleClose = () => {
        if (!loading) {
            setError(null);
            setErrors({});
            onClose();
        }
    };

    const handleConfirmStamp = async () => {
        const newErrors = {};

        if (!acceptTerms) {
            newErrors.acceptTerms = 'Vui lòng xác nhận đồng ý với nội dung và điều khoản của tài liệu.';
        }

        // Validate text fields (đặc biệt là contract number fields - type 4)
        textFields.forEach(field => {
            if (field.type === 4) {
                // Contract number field là bắt buộc
                const value = textFieldValues[field.id] || '';
                if (!value.trim()) {
                    newErrors[`field_${field.id}`] = 'Vui lòng nhập số hợp đồng';
                }
            }
        });

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Sau khi xác nhận đóng dấu -> load danh sách chứng thư và chuyển sang bước 2
        await loadCertificates();
        setStep(2);
    };

    const handleSign = async () => {
        const newErrors = {};

        if (!selectedCertId) {
            newErrors.certId = 'Vui lòng chọn chứng thư số';
        }

        // Kiểm tra có field để ký không
        if (!availableFields.length) {
            newErrors.field = 'Không có field nào để ký. Vui lòng kiểm tra lại.';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            setError(null);

            // Tạo danh sách tất cả các fields cần xử lý (text fields + signature fields)
            // Sắp xếp theo thứ tự: text fields trước (type 1, 4), sau đó signature fields (type 3)
            const fieldsToProcess = [];

            // 1. Thêm text fields và contract number fields (type 1, 4) trước
            // Sắp xếp text fields theo ordering để đảm bảo thứ tự đúng
            const sortedTextFields = [...textFields].sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
            sortedTextFields.forEach(field => {
                const fieldValue = textFieldValues[field.id] || '';
                
                fieldsToProcess.push({
                    field: field,
                    type: 'text',
                    value: fieldValue.trim() // Lưu text value để convert sang image sau
                });
            });

            // 2. Thêm signature fields (type 3) sau
            // Sắp xếp signature fields theo ordering để đảm bảo thứ tự đúng
            const sortedSignatureFields = [...availableFields].sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
            sortedSignatureFields.forEach(field => {
                fieldsToProcess.push({
                    field: field,
                    type: 'signature'
                });
            });

            // 3. Gọi API cho từng field riêng biệt theo thứ tự
            for (const item of fieldsToProcess) {
                if (item.type === 'text') {
                    // Text field: Convert text sang image base64 và gọi API certificate
                    try {
                        const field = item.field;
                        const textValue = item.value;
                        
                        // Convert text to image base64
                        const textImageBase64 = await convertTextToImageBase64(textValue, field);
                        
                        const certData = {
                            certId: parseInt(selectedCertId, 10),
                            imageBase64: textImageBase64, // Image được render từ text
                            field: {
                                id: field.id,
                                page: field.page || 1,
                                boxX: field.boxX || 0,
                                boxY: field.boxY || 0,
                                boxW: field.boxW || 100,
                                boxH: field.boxH || 30
                            },
                            width: null,
                            height: null,
                            isTimestamp: "false",
                            type: field.type // type 1 hoặc 4 cho text field
                        };

                        const certResponse = await contractService.certificate(recipientId, certData);
                        if (certResponse?.code !== 'SUCCESS') {
                            throw new Error(certResponse?.message || 'Ký text field thất bại');
                        }
                    } catch (err) {
                        console.error('Error signing text field:', err);
                        throw new Error(err.message || 'Ký text field thất bại. Vui lòng thử lại.');
                    }
                } else if (item.type === 'signature') {
                    // Gọi API ký signature field
                    const field = item.field;
                    // Tách base64 thuần từ data URL (bỏ prefix) trước khi gửi lên server
                    const base64Only = imageBase64 ? extractBase64FromDataURL(imageBase64) : null;
                    
                    const certData = {
                        certId: parseInt(selectedCertId, 10),
                        imageBase64: base64Only || null,
                        field: {
                            id: field.id,
                            page: field.page || 1,
                            boxX: field.boxX || 0,
                            boxY: field.boxY || 0,
                            boxW: field.boxW || 100,
                            boxH: field.boxH || 30
                        },
                        width: null,
                        height: null,
                        isTimestamp: "false",
                        type: 3
                    };

                    const response = await contractService.certificate(recipientId, certData);
                    if (response?.code !== 'SUCCESS') {
                        throw new Error(response?.message || 'Ký hợp đồng thất bại');
                    }
                }
            }

            // Sau khi xử lý hết các field, gọi API phê duyệt luồng cho recipient hiện tại
            const approvalRes = await contractService.approvalProcess(recipientId);
            if (approvalRes?.code !== 'SUCCESS') {
                throw new Error(approvalRes?.message || 'Phê duyệt hợp đồng thất bại');
            }

            if (onSigned) {
                onSigned({ success: true });
            }
            // Đóng dialog, điều hướng sẽ do màn cha (ContractDetail) xử lý qua onSigned
            handleClose();
        } catch (err) {
            console.error('Error signing contract:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi ký hợp đồng';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (!open) return null;

    return (
        <>
            {/* Loading Overlay - Full Screen */}
            {loading && (
                <div className="sign-loading-overlay-fullscreen">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Đang xử lý, vui lòng đợi...</div>
                </div>
            )}
            
            <div className="sign-dialog-overlay" onClick={handleClose}>
                <div className="sign-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="sign-dialog-header">
                    <h3>{step === 1 ? step1Title : step2Title}</h3>
                    <button 
                        className="sign-dialog-close" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className="sign-dialog-body">
                    {error && (
                        <div className="sign-dialog-error">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            <div className="sign-dialog-field">
                                <label className="sign-dialog-label">Nguồn ảnh đóng dấu</label>
                                <div className="sign-dialog-stamp-options">
                                    <label className="sign-dialog-radio-option">
                                        <input
                                            type="radio"
                                            name="stampOption"
                                            value="none"
                                            checked={stampOption === 'none'}
                                            onChange={() => setStampOption('none')}
                                            disabled={loading}
                                        />
                                        <span>Không chọn ảnh</span>
                                    </label>
                                    <label className="sign-dialog-radio-option">
                                        <input
                                            type="radio"
                                            name="stampOption"
                                            value="upload"
                                            checked={stampOption === 'upload'}
                                            onChange={() => setStampOption('upload')}
                                            disabled={loading}
                                        />
                                        <span>Tải ảnh lên</span>
                                    </label>
                                </div>
                            </div>

                            {stampOption === 'upload' && (
                                <div className="sign-dialog-field">
                                    <label className="sign-dialog-label">Tải ảnh chữ ký / con dấu</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={loading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                // Lưu data URL để preview (có prefix)
                                                setImageBase64(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }}
                                    />
                                </div>
                            )}

                            <div className="sign-dialog-field">
                                <label className="sign-dialog-label">Preview</label>
                                <div className="sign-dialog-preview-box">
                                    {imageBase64 ? (
                                        <img src={imageBase64} alt="Preview chữ ký" />
                                    ) : (
                                        <div className="sign-dialog-preview-placeholder">
                                            Hình ảnh chữ ký / con dấu sẽ hiển thị tại đây
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="sign-dialog-field">
                                <label className="sign-dialog-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span>
                                        Tôi đồng ý với nội dung, các điều khoản trong tài liệu và sử dụng phương thức điện tử để thực hiện giao dịch.
                                    </span>
                                </label>
                                {errors.acceptTerms && (
                                    <span className="sign-dialog-error-text">{errors.acceptTerms}</span>
                                )}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="sign-dialog-field">
                                <label className="sign-dialog-label">Danh sách chứng thư số</label>
                                <div className="sign-dialog-cert-table-wrapper">
                                    <table className="sign-dialog-cert-table">
                                        <thead>
                                            <tr>
                                                <th>Lựa chọn</th>
                                                <th>Ký hiệu</th>
                                                <th>Chủ thể</th>
                                                <th>MST/CCCD</th>
                                                <th>Ngày hết hạn</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certificates.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: 'center', padding: '12px' }}>
                                                        Không có chứng thư số nào. Vui lòng import chứng thư số trước.
                                                    </td>
                                                </tr>
                                            )}
                                            {certificates.map(cert => (
                                                <tr key={cert.id}>
                                                    <td>
                                                        <input
                                                            type="radio"
                                                            name="selectedCert"
                                                            value={cert.id}
                                                            checked={selectedCertId === cert.id?.toString()}
                                                            onChange={() => {
                                                                setSelectedCertId(cert.id?.toString());
                                                                setErrors(prev => ({ ...prev, certId: '' }));
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{cert.keystoreSerialNumber || '-'}</td>
                                                    <td>{extractSubjectName(cert.certInformation) || '-'}</td>
                                                    <td>{extractTaxCode(cert.certInformation) || '-'}</td>
                                                    <td>{formatDate(cert.keystoreDateEnd) || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {errors.certId && (
                                    <span className="sign-dialog-error-text">{errors.certId}</span>
                                )}
                                {errors.field && (
                                    <span className="sign-dialog-error-text">{errors.field}</span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="sign-dialog-footer">
                    <button
                        className="sign-dialog-btn sign-dialog-btn-cancel"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {step === 1 ? 'Đóng' : 'Hủy bỏ'}
                    </button>
                    {step === 1 ? (
                        <button
                            className="sign-dialog-btn sign-dialog-btn-primary"
                            onClick={handleConfirmStamp}
                            disabled={loading}
                        >
                            Xác nhận
                        </button>
                    ) : (
                        <button
                            className="sign-dialog-btn sign-dialog-btn-primary"
                            onClick={handleSign}
                            disabled={loading || certificates.length === 0}
                        >
                            {loading ? 'Đang ký...' : 'Ký'}
                        </button>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default SignDialog;

