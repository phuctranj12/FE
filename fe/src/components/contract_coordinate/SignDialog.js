import React, { useState, useEffect } from 'react';
import contractService from '../../api/contractService';
import '../../styles/signDialog.css';

function SignDialog({ 
    open, 
    onClose, 
    contractId, 
    recipientId,
    fields = [],
    onSigned 
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State cho form
    const [certificates, setCertificates] = useState([]);
    const [selectedCertId, setSelectedCertId] = useState('');
    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [isTimestamp, setIsTimestamp] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    
    // State cho validation
    const [errors, setErrors] = useState({});

    // Load certificates khi dialog mở
    useEffect(() => {
        if (open && recipientId) {
            loadCertificates();
        }
    }, [open, recipientId]);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await contractService.getCertByUser();
            
            if (response?.code === 'SUCCESS') {
                const certs = response.data || [];
                setCertificates(certs);
                
                // Auto select first valid certificate
                if (certs.length > 0) {
                    const validCert = certs.find(cert => {
                        if (cert.validTo) {
                            return new Date(cert.validTo) > new Date();
                        }
                        return cert.status === 1;
                    });
                    if (validCert) {
                        setSelectedCertId(validCert.id.toString());
                    } else if (certs.length > 0) {
                        setSelectedCertId(certs[0].id.toString());
                    }
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

    // Filter fields: chỉ lấy field type = 3 (DIGITAL_SIGN) và status = 0 (chưa ký) và thuộc về recipient này
    const availableFields = fields.filter(field => 
        field.type === 3 && 
        field.status === 0 && 
        field.recipientId === recipientId
    );

    const validateForm = () => {
        const newErrors = {};
        
        if (!selectedCertId) {
            newErrors.certId = 'Vui lòng chọn chứng thư số';
        }
        
        if (!selectedFieldId) {
            newErrors.fieldId = 'Vui lòng chọn field cần ký';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSign = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Tìm field được chọn
            const selectedField = availableFields.find(f => f.id.toString() === selectedFieldId);
            if (!selectedField) {
                throw new Error('Field không hợp lệ');
            }

            // Chuẩn bị request body
            const certData = {
                certId: parseInt(selectedCertId),
                isTimestamp: isTimestamp ? "true" : "false",
                imageBase64: imageBase64 || null,
                field: {
                    id: selectedField.id,
                    page: selectedField.page || 1,
                    boxX: selectedField.boxX || 0,
                    boxY: selectedField.boxY || 0,
                    boxW: selectedField.boxW || 100,
                    boxH: selectedField.boxH || 30
                },
                width: null,
                height: null,
                type: 3
            };

            // Gọi API ký
            const response = await contractService.certificate(recipientId, certData);
            
            if (response?.code === 'SUCCESS') {
                // Success
                if (onSigned) {
                    onSigned(response.data);
                }
                handleClose();
            } else {
                throw new Error(response?.message || 'Ký hợp đồng thất bại');
            }
        } catch (err) {
            console.error('Error signing contract:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi ký hợp đồng';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError(null);
            setErrors({});
            setSelectedCertId('');
            setSelectedFieldId('');
            setIsTimestamp(false);
            setImageBase64(null);
            onClose();
        }
    };

    const formatCertDisplay = (cert) => {
        const subject = cert.subject || 'Chưa có tên';
        const validFrom = cert.validFrom ? new Date(cert.validFrom).toLocaleDateString('vi-VN') : '';
        const validTo = cert.validTo ? new Date(cert.validTo).toLocaleDateString('vi-VN') : '';
        const isValid = cert.validTo ? new Date(cert.validTo) > new Date() : cert.status === 1;
        
        return `${subject} - Valid: ${validFrom} to ${validTo}${!isValid ? ' (Hết hạn)' : ''}`;
    };

    const isCertValid = (cert) => {
        if (cert.validTo) {
            return new Date(cert.validTo) > new Date();
        }
        return cert.status === 1;
    };

    if (!open) return null;

    return (
        <div className="sign-dialog-overlay" onClick={handleClose}>
            <div className="sign-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="sign-dialog-header">
                    <h3>Ký hợp đồng bằng chứng thư số</h3>
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

                    {/* Chọn chứng thư số */}
                    <div className="sign-dialog-field">
                        <label className="sign-dialog-label">
                            Chứng thư số <span className="required">*</span>
                        </label>
                        <select
                            className={`sign-dialog-select ${errors.certId ? 'error' : ''}`}
                            value={selectedCertId}
                            onChange={(e) => {
                                setSelectedCertId(e.target.value);
                                setErrors({ ...errors, certId: '' });
                            }}
                            disabled={loading || certificates.length === 0}
                        >
                            <option value="">-- Chọn chứng thư số --</option>
                            {certificates.map(cert => (
                                <option 
                                    key={cert.id} 
                                    value={cert.id}
                                    disabled={!isCertValid(cert)}
                                >
                                    {formatCertDisplay(cert)}
                                </option>
                            ))}
                        </select>
                        {errors.certId && (
                            <span className="sign-dialog-error-text">{errors.certId}</span>
                        )}
                        {certificates.length === 0 && !loading && (
                            <div className="sign-dialog-warning">
                                Bạn chưa có chứng thư số. Vui lòng import chứng thư số trước.
                            </div>
                        )}
                    </div>

                    {/* Chọn field ký */}
                    <div className="sign-dialog-field">
                        <label className="sign-dialog-label">
                            Field cần ký <span className="required">*</span>
                        </label>
                        <select
                            className={`sign-dialog-select ${errors.fieldId ? 'error' : ''}`}
                            value={selectedFieldId}
                            onChange={(e) => {
                                setSelectedFieldId(e.target.value);
                                setErrors({ ...errors, fieldId: '' });
                            }}
                            disabled={loading || availableFields.length === 0}
                        >
                            <option value="">-- Chọn field cần ký --</option>
                            {availableFields.map(field => (
                                <option key={field.id} value={field.id}>
                                    {field.name || `Field ${field.id}`} - Trang {field.page || 1}
                                </option>
                            ))}
                        </select>
                        {errors.fieldId && (
                            <span className="sign-dialog-error-text">{errors.fieldId}</span>
                        )}
                        {availableFields.length === 0 && (
                            <div className="sign-dialog-warning">
                                Không có field nào để ký. Vui lòng kiểm tra lại.
                            </div>
                        )}
                    </div>

                    {/* Đóng dấu thời gian */}
                    <div className="sign-dialog-field">
                        <label className="sign-dialog-checkbox-label">
                            <input
                                type="checkbox"
                                checked={isTimestamp}
                                onChange={(e) => setIsTimestamp(e.target.checked)}
                                disabled={loading}
                            />
                            <span>Đóng dấu thời gian</span>
                        </label>
                    </div>

                    {/* Hiển thị thông tin field được chọn */}
                    {selectedFieldId && (() => {
                        const selectedField = availableFields.find(f => f.id.toString() === selectedFieldId);
                        if (selectedField) {
                            return (
                                <div className="sign-dialog-field-info">
                                    <h4>Thông tin field:</h4>
                                    <ul>
                                        <li>Tên: {selectedField.name || 'N/A'}</li>
                                        <li>Trang: {selectedField.page || 1}</li>
                                        <li>Vị trí: X={selectedField.boxX}, Y={selectedField.boxY}</li>
                                        <li>Kích thước: W={selectedField.boxW}, H={selectedField.boxH}</li>
                                    </ul>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                <div className="sign-dialog-footer">
                    <button
                        className="sign-dialog-btn sign-dialog-btn-cancel"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="sign-dialog-btn sign-dialog-btn-primary"
                        onClick={handleSign}
                        disabled={loading || certificates.length === 0 || availableFields.length === 0}
                    >
                        {loading ? 'Đang ký...' : 'Ký hợp đồng'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignDialog;

