import React, { useState, useEffect } from 'react';
import '../../styles/docTypeFormModal.css';
import Button from '../common/Button';
import SwitchButton from '../common/SwitchButton';

const DocTypeFormModal = ({ docType, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        autoSign: false,
        status: 1,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin' // TODO: Get from auth context
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (docType) {
            setFormData({
                ...docType,
                createdDate: docType.createdDate || new Date().toISOString().split('T')[0]
            });
        }
    }, [docType]);

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

        if (!formData.code.trim()) {
            newErrors.code = 'Mã loại tài liệu không được để trống';
        } else if (formData.code.length < 2) {
            newErrors.code = 'Mã loại tài liệu phải có ít nhất 2 ký tự';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Tên loại tài liệu không được để trống';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Tên loại tài liệu phải có ít nhất 3 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
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
                        <label htmlFor="code">
                            Mã loại tài liệu <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="code"
                            className={`form-input ${errors.code ? 'error' : ''}`}
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                            placeholder="Ví dụ: HD-DV"
                            disabled={!!docType} // Disable code edit when editing
                        />
                        {errors.code && <span className="error-text">{errors.code}</span>}
                    </div>

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
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Nhập mô tả cho loại tài liệu"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="autoSign">Ký tự động</label>
                        <div className="form-switch-wrapper">
                            <SwitchButton
                                checked={formData.autoSign}
                                onChange={(checked) => handleChange('autoSign', checked)}
                            />
                            <span className="form-switch-label">
                                {formData.autoSign ? 'Bật' : 'Tắt'}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Trạng thái</label>
                        <select
                            id="status"
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => handleChange('status', Number(e.target.value))}
                        >
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Không hoạt động</option>
                        </select>
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

