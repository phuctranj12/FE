import React, { useState } from 'react';
import '../../styles/addOrganizationPanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import OrganizationSelect from '../common/OrganizationSelect';

const AddOrganizationPanel = ({ onClose, onSave, organizations = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        phone: '',
        code: '',
        parentOrg: null,
        abbreviation: '',
        email: '',
        taxId: '',
        fax: '',
        status: 1 // 1 = Hoạt động, 0 = Không hoạt động
    });

    // Use organizations from props instead of hardcoded sample data

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.name || !formData.code || !formData.parentOrg) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }
        
        onSave && onSave(formData);
        onClose && onClose();
    };

    return (
        <div className="add-org-overlay">
            <div className="add-org-panel">
                <div className="add-org-header">
                    <h2>THÊM MỚI TỔ CHỨC</h2>
                </div>

                <div className="add-org-form">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Tên tổ chức <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập tên tổ chức" 
                                value={formData.name} 
                                onChange={(value) => handleInputChange('name', value)} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>ID</label>
                            <SearchBar 
                                placeholder="Nhập ID" 
                                value={formData.id} 
                                onChange={(value) => handleInputChange('id', value)} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Tên viết tắt</label>
                            <SearchBar 
                                placeholder="Nhập tên viết tắt" 
                                value={formData.abbreviation} 
                                onChange={(value) => handleInputChange('abbreviation', value)} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <SearchBar 
                                placeholder="Nhập số điện thoại" 
                                value={formData.phone} 
                                onChange={(value) => handleInputChange('phone', value)} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ email</label>
                            <SearchBar 
                                placeholder="Nhập địa chỉ email" 
                                value={formData.email} 
                                onChange={(value) => handleInputChange('email', value)} 
                                type="email"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã tổ chức <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập mã tổ chức" 
                                value={formData.code} 
                                onChange={(value) => handleInputChange('code', value)} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Mã số thuế/CMT/CCCD</label>
                            <SearchBar 
                                placeholder="Nhập mã số thuế/CMT/CCCD" 
                                value={formData.taxId} 
                                onChange={(value) => handleInputChange('taxId', value)} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tổ chức cấp trên <span className="required">*</span></label>
                            <OrganizationSelect
                                organizations={organizations}
                                value={formData.parentOrg}
                                onChange={(org) => handleInputChange('parentOrg', org?.id)}
                                placeholder="Chọn tổ chức cấp trên"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fax</label>
                            <SearchBar 
                                placeholder="Nhập số fax" 
                                value={formData.fax} 
                                onChange={(value) => handleInputChange('fax', value)} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="1" 
                                        checked={formData.status === 1}
                                        onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
                                    />
                                    <span>Hoạt động</span>
                                </label>
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="0" 
                                        checked={formData.status === 0}
                                        onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
                                    />
                                    <span>Không hoạt động</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group"></div>
                    </div>
                </div>

                <div className="add-org-actions">
                    <Button 
                        outlineColor="#6c757d" 
                        backgroundColor="transparent" 
                        text="Hủy bỏ" 
                        onClick={onClose}
                    />
                    <Button 
                        outlineColor="#0B57D0" 
                        backgroundColor="#0B57D0" 
                        text="Lưu lại" 
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddOrganizationPanel;
