import React from 'react';
import '../../styles/addOrganizationPanel.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import OrganizationSelect from '../common/OrganizationSelect';

// Read-only panel to view organization details
const ViewOrganizationPanel = ({ organization = {}, organizations = [], onClose }) => {
    const formData = {
        id: organization.id ?? '',
        name: organization.name ?? '',
        abbreviation: organization.abbreviation ?? '',
        phone: organization.phone ?? '',
        email: organization.email ?? '',
        code: organization.code ?? '',
        taxId: organization.taxCode ?? organization.taxId ?? '',
        parentOrg: organization.parentId ?? organization.parent_id ?? null,
        fax: organization.fax ?? '',
        status: organization.status ?? 1,
    };

    return (
        <div className="add-org-overlay">
            <div className="add-org-panel">
                <div className="add-org-header">
                    <h2>THÔNG TIN TỔ CHỨC</h2>
                </div>

                <div className="add-org-form">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Tên tổ chức</label>
                            <SearchBar placeholder="Tên tổ chức" value={formData.name} onChange={() => {}} disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>ID</label>
                            <SearchBar placeholder="ID" value={formData.id} onChange={() => {}} disabled />
                        </div>
                        <div className="form-group">
                            <label>Tên viết tắt</label>
                            <SearchBar placeholder="Tên viết tắt" value={formData.abbreviation} onChange={() => {}} disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <SearchBar placeholder="Số điện thoại" value={formData.phone} onChange={() => {}} disabled />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ email</label>
                            <SearchBar placeholder="Email" value={formData.email} onChange={() => {}} type="email" disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã tổ chức</label>
                            <SearchBar placeholder="Mã tổ chức" value={formData.code} onChange={() => {}} disabled />
                        </div>
                        <div className="form-group">
                            <label>Mã số thuế/CMT/CCCD</label>
                            <SearchBar placeholder="Mã số thuế/CMT/CCCD" value={formData.taxId} onChange={() => {}} disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tổ chức cấp trên</label>
                            <OrganizationSelect
                                organizations={organizations}
                                value={formData.parentOrg}
                                onChange={() => {}}
                                placeholder="Tổ chức cấp trên"
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Fax</label>
                            <SearchBar placeholder="Fax" value={formData.fax} onChange={() => {}} disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input type="radio" name="status" value="1" checked={formData.status === 1} readOnly disabled />
                                    <span>Hoạt động</span>
                                </label>
                                <label className="radio-item">
                                    <input type="radio" name="status" value="0" checked={formData.status === 0} readOnly disabled />
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
                        text="Đóng" 
                        onClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default ViewOrganizationPanel;


