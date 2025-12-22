import React, { useState, useEffect } from 'react';
import Notiflix from 'notiflix';
import '../../styles/modal.css';
import contractService from '../../api/contractService';

function AuthorizeDialog({ 
    open, 
    onClose, 
    recipientId,
    recipientRole, // 1 = coordinator, 3 = signer
    onAuthorizeSuccess 
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        signType: 6,
        taxCode: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            // Reset form when dialog closes
            setFormData({
                name: '',
                email: '',
                signType: 1,
                taxCode: ''
            });
            setErrors({});
            setLoading(false);
        }
    }, [open]);

    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập họ tên';
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Email không hợp lệ';
            }
        }

        // Validate taxCode for signer only
        if (recipientRole === 3 && !formData.taxCode.trim()) {
            newErrors.taxCode = 'Vui lòng nhập mã số thuế/CMT/CCCD';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                signType: recipientRole === 3 ? 1 : formData.signType, // Fix cứng signType = 1 cho signer
                ...(recipientRole === 3 && { taxCode: formData.taxCode.trim() })
            };

            const response = await contractService.authorize(recipientId, payload);

            if (response?.code === 'SUCCESS') {
                if (onAuthorizeSuccess) {
                    onAuthorizeSuccess(response.data);
                }
                // Đóng dialog
                onClose();
            } else {
                throw new Error(response?.message || 'Ủy quyền thất bại');
            }
        } catch (error) {
            console.error('Error authorizing contract:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi ủy quyền';
            Notiflix.Notify.failure(errorMessage);
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        if (errors.submit) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.submit;
                return newErrors;
            });
        }
    };

    if (!open) return null;

    const isCoordinator = recipientRole === 1;
    const isSigner = recipientRole === 3;

    return (
        <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ minWidth: '450px', maxWidth: '550px' }}>
                <div className="modal-header">
                    <h3>Ủy quyền/Chuyển tiếp</h3>
                    <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
                </div>
                <div className="modal-body">
                    {isCoordinator && (
                        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                            Nhập thông tin người được ủy quyền để xử lý hợp đồng thay bạn.
                        </p>
                    )}

                    {isSigner && (
                        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                            Nhập thông tin người được ủy quyền để ký hợp đồng thay bạn.
                        </p>
                    )}

                    <div className="form-group">
                        <label htmlFor="name">
                            Họ tên <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={`text-input ${errors.name ? 'error' : ''}`}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Nhập họ tên người được ủy quyền"
                            disabled={loading}
                        />
                        {errors.name && (
                            <span style={{ color: '#d32f2f', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`text-input ${errors.email ? 'error' : ''}`}
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email@example.com"
                            disabled={loading}
                        />
                        {errors.email && (
                            <span style={{ color: '#d32f2f', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {isSigner && (
                        <>
                            <div className="form-group">
                                <label htmlFor="signType">
                                    Loại ký
                                </label>
                                <input
                                    type="text"
                                    id="signType"
                                    className="text-input"
                                    value="Ký bằng chứng thư số server"
                                    disabled
                                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="taxCode">
                                    Mã số thuế/CMT/CCCD <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="taxCode"
                                    className={`text-input ${errors.taxCode ? 'error' : ''}`}
                                    value={formData.taxCode}
                                    onChange={(e) => handleChange('taxCode', e.target.value)}
                                    placeholder="Nhập mã số thuế/CMT/CCCD"
                                    disabled={loading}
                                />
                                {errors.taxCode && (
                                    <span style={{ color: '#d32f2f', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                        {errors.taxCode}
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn-cancel" 
                        onClick={onClose} 
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Ủy quyền/Chuyển tiếp'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthorizeDialog;

