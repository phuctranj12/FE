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
    const [organizations, setOrganizations] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);

    useEffect(() => {
        fetchOrganizations();
        if (docType) {
            setFormData({
                name: docType.name || '',
                organizationId: docType.organizationId || '',
                status: docType.status !== undefined ? docType.status : 1
            });
        } else {
            // Reset form when adding new
            setFormData({
                name: '',
                organizationId: '',
                status: 1
            });
        }
    }, [docType]);

    const fetchOrganizations = async () => {
        setLoadingOrgs(true);
        try {
            const response = await customerService.getAllOrganizations({
                page: 0,
                size: 1000 // Get all organizations
            });
            if (response.code === 'SUCCESS' && response.data) {
                setOrganizations(response.data.content || []);
            }
        } catch (e) {
            console.error('Error fetching organizations:', e);
        } finally {
            setLoadingOrgs(false);
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

        if (!formData.organizationId || formData.organizationId === '' || formData.organizationId === 0) {
            newErrors.organizationId = 'Vui lòng chọn tổ chức';
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
                        <select
                            id="organizationId"
                            className={`form-select ${errors.organizationId ? 'error' : ''}`}
                            value={formData.organizationId}
                            onChange={(e) => handleChange('organizationId', Number(e.target.value))}
                            disabled={loadingOrgs}
                        >
                            <option value="">-- Chọn tổ chức --</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
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

