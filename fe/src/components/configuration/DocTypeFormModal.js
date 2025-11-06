import React, { useState, useEffect } from 'react';
import '../../styles/docTypeFormModal.css';
import Button from '../common/Button';
import SwitchButton from '../common/SwitchButton';
import customerService from '../../api/customerService';

const DocTypeFormModal = ({ docType, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        organizationId: '',
        status: 1
    });

    const [errors, setErrors] = useState({});
    const [organizationName, setOrganizationName] = useState('');
    const [loadingOrg, setLoadingOrg] = useState(true);

    useEffect(() => {
        fetchUserOrganization();
    }, []);

    useEffect(() => {
        if (formData.organizationId) {
            if (docType) {
                setFormData(prev => ({
                    ...prev,
                    name: docType.name || '',
                    status: docType.status !== undefined ? docType.status : 1
                }));
            } else {
                // Reset form when adding new
                setFormData(prev => ({
                    ...prev,
                    name: '',
                    status: 1
                }));
            }
        }
    }, [docType, formData.organizationId]);

    const fetchUserOrganization = async () => {
        setLoadingOrg(true);
        try {
            const response = await customerService.getCustomerByToken();
            if (response.code === 'SUCCESS' && response.data) {
                const orgId = response.data.organizationId;
                if (orgId) {
                    setFormData(prev => ({
                        ...prev,
                        organizationId: orgId
                    }));
                    
                    // Lấy tên tổ chức để hiển thị
                    try {
                        const orgResponse = await customerService.getOrganizationById(orgId);
                        if (orgResponse.code === 'SUCCESS' && orgResponse.data) {
                            setOrganizationName(orgResponse.data.name || '');
                        }
                    } catch (e) {
                        console.error('Error fetching organization name:', e);
                    }
                } else {
                    console.error('Không tìm thấy organizationId trong thông tin user');
                }
            }
        } catch (e) {
            console.error('Error fetching user organization:', e);
        } finally {
            setLoadingOrg(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên loại tài liệu không được để trống';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Tên loại tài liệu phải có ít nhất 3 ký tự';
        }

        // organizationId luôn được fix cứng từ user hiện tại, không cần validate
        if (!formData.organizationId || formData.organizationId === '' || formData.organizationId === 0) {
            newErrors.organizationId = 'Không thể lấy thông tin tổ chức';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Ensure organizationId is a number and status is always 1 (active)
            const submitData = {
                name: formData.name.trim(),
                organizationId: Number(formData.organizationId),
                status: 1 // Always active when creating or editing
            };
            onSave(submitData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{docType ? 'Chỉnh sửa loại tài liệu' : 'Thêm loại tài liệu mới'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="name">
                            Tên loại tài liệu <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ví dụ: Hợp đồng dịch vụ"
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="organizationId">
                            Tổ chức <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="organizationId"
                            className={`form-input ${errors.organizationId ? 'error' : ''}`}
                            value={loadingOrg ? 'Đang tải...' : (organizationName || 'Tổ chức hiện tại')}
                            disabled={true}
                            readOnly
                        />
                        {errors.organizationId && <span className="error-text">{errors.organizationId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Active</label>
                        <div className="form-switch-wrapper">
                            <SwitchButton
                                checked={true}
                                onChange={() => {}} // Disabled, không cho phép thay đổi
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <Button
                            outlineColor="#6c757d"
                            backgroundColor="transparent"
                            text="Hủy"
                            onClick={onClose}
                        />
                        <Button
                            outlineColor="#0B57D0"
                            backgroundColor="#0B57D0"
                            text={docType ? 'Cập nhật' : 'Thêm mới'}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocTypeFormModal;

