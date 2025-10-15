import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/addNewUser.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import OrganizationSelect from '../common/OrganizationSelect';

const AddNewUser = ({ onCancel }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Thông tin cá nhân
        fullName: '',
        email: '',
        birthDate: '',
        phone: '',
        organization: null,
        role: null,
        loginMethod: 'email', // email, phone, both
        accountStatus: 1, // 1 = Hoạt động, 0 = Không hoạt động
        
        // Thông tin chữ ký
        smsSignatureImage: null,
        digitalSignatureImage: null,
        pkiPhone: '',
        pkiNetwork: null,
        showPhoneOnSignature: true,
        hsmProvider: null,
        hsmUuid: ''
    });

    // Sample data
    const organizations = [
        { id: 226, name: 'Trung tâm công nghệ thông tin MobiFone' },
        { id: 1215, name: 'TC230301' },
        { id: 1216, name: 'haitest1231' },
        { id: 1242, name: 'Công ty Dịch vụ MobiFone Khu vực 8' },
    ];

    const roles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Member' },
        { id: 3, name: 'Viewer' },
    ];

    const networks = [
        { id: 1, name: 'Viettel' },
        { id: 2, name: 'MobiFone' },
        { id: 3, name: 'Vinaphone' },
    ];

    const providers = [
        { id: 1, name: 'CA Viettel' },
        { id: 2, name: 'CA MobiFone' },
        { id: 3, name: 'CA Vinaphone' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (field, file) => {
        // Handle image upload logic here
        console.log(`Uploading ${field}:`, file);
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone || !formData.organization || !formData.role) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            return;
        }
        
        console.log('Saving user:', formData);
        // Implement save logic here
        onCancel && onCancel();
    };

    const handleCancel = () => {
        onCancel && onCancel();
    };

    return (
        <div className="user-management-container">
            

            <div className="add-user-content">
                {/* THÔNG TIN CÁ NHÂN */}
                <div className="section">
                    <h2 className="section-title">THÔNG TIN CÁ NHÂN</h2>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Họ tên <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập họ tên" 
                                value={formData.fullName} 
                                onChange={(value) => handleInputChange('fullName', value)} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Email <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập email" 
                                value={formData.email} 
                                onChange={(value) => handleInputChange('email', value)} 
                                type="email"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <div className="date-input-group">
                                <SearchBar 
                                    placeholder="dd/MM/yyyy" 
                                    value={formData.birthDate} 
                                    onChange={(value) => handleInputChange('birthDate', value)} 
                                />
                                <button type="button" className="calendar-btn">📅</button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Số điện thoại <span className="required">*</span></label>
                            <SearchBar 
                                placeholder="Nhập số điện thoại" 
                                value={formData.phone} 
                                onChange={(value) => handleInputChange('phone', value)} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Tổ chức <span className="required">*</span></label>
                            <OrganizationSelect
                                organizations={organizations}
                                value={formData.organization}
                                onChange={(org) => handleInputChange('organization', org?.id)}
                                placeholder="Chọn tổ chức"
                                searchPlaceholder="Tìm kiếm tổ chức..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Vai trò <span className="required">*</span></label>
                            <OrganizationSelect
                                organizations={roles}
                                value={formData.role}
                                onChange={(role) => handleInputChange('role', role?.id)}
                                placeholder="Chọn vai trò"
                                searchPlaceholder="Tìm kiếm vai trò..."
                            />
                        </div>
                    </div>

                    <div className="radio-sections">
                        <div className="radio-section">
                            <label className="radio-section-label">Chọn hình thức đăng nhập:</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="loginMethod" 
                                        value="email" 
                                        checked={formData.loginMethod === 'email'}
                                        onChange={(e) => handleInputChange('loginMethod', e.target.value)}
                                    />
                                    <span>Đăng nhập bằng email</span>
                                </label>
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="loginMethod" 
                                        value="phone" 
                                        checked={formData.loginMethod === 'phone'}
                                        onChange={(e) => handleInputChange('loginMethod', e.target.value)}
                                    />
                                    <span>Đăng nhập bằng số điện thoại</span>
                                </label>
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="loginMethod" 
                                        value="both" 
                                        checked={formData.loginMethod === 'both'}
                                        onChange={(e) => handleInputChange('loginMethod', e.target.value)}
                                    />
                                    <span>Đăng nhập bằng Email và SĐT</span>
                                </label>
                            </div>
                        </div>

                        <div className="radio-section">
                            <label className="radio-section-label">Trạng thái tài khoản:</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="accountStatus" 
                                        value="1" 
                                        checked={formData.accountStatus === 1}
                                        onChange={(e) => handleInputChange('accountStatus', parseInt(e.target.value))}
                                    />
                                    <span>Hoạt động</span>
                                </label>
                                <label className="radio-item">
                                    <input 
                                        type="radio" 
                                        name="accountStatus" 
                                        value="0" 
                                        checked={formData.accountStatus === 0}
                                        onChange={(e) => handleInputChange('accountStatus', parseInt(e.target.value))}
                                    />
                                    <span>Không hoạt động</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN CHỮ KÝ */}
                <div className="section">
                    <h2 className="section-title">THÔNG TIN CHỮ KÝ</h2>
                    
                    <div className="signature-grid">
                        {/* HÌNH ẢNH CHỮ KÝ HÌNH THỨC SMS OTP - 25% */}
                        <div className="signature-column">
                            <h3 className="signature-subtitle">HÌNH ẢNH CHỮ KÝ HÌNH THỨC SMS OTP</h3>
                            <div className="image-upload-area">
                                <button 
                                    type="button" 
                                    className="upload-btn"
                                    onClick={() => document.getElementById('sms-signature').click()}
                                >
                                    Tải ảnh lên
                                </button>
                                <input 
                                    type="file" 
                                    id="sms-signature" 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageUpload('smsSignatureImage', e.target.files[0])}
                                />
                                <p className="upload-instruction">
                                    Vui lòng tải lên ảnh chữ ký/ con dấu đã được tách nền (PNG) để đảm bảo hiển thị chính xác và chuyên nghiệp trên tài liệu/ hợp đồng!
                                </p>
                            </div>
                        </div>

                        {/* HÌNH ẢNH CHỮ KÝ/CON DẤU KÝ SỐ - 25% */}
                        <div className="signature-column">
                            <h3 className="signature-subtitle">HÌNH ẢNH CHỮ KÝ/CON DẤU KÝ SỐ</h3>
                            <div className="image-upload-area">
                                <button 
                                    type="button" 
                                    className="upload-btn"
                                    onClick={() => document.getElementById('digital-signature').click()}
                                >
                                    Tải ảnh lên
                                </button>
                                <input 
                                    type="file" 
                                    id="digital-signature" 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageUpload('digitalSignatureImage', e.target.files[0])}
                                />
                                <p className="upload-instruction">
                                    Vui lòng tải lên ảnh chữ ký/ con dấu đã được tách nền (PNG) để đảm bảo hiển thị chính xác và chuyên nghiệp trên tài liệu/ hợp đồng!
                                </p>
                            </div>
                        </div>

                        {/* CHỮ KÝ PKI - 25% */}
                        <div className="signature-column">
                            <h3 className="signature-subtitle">CHỮ KÝ PKI</h3>
                            <div className="signature-form">
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <SearchBar 
                                        placeholder="Nhập số điện thoại" 
                                        value={formData.pkiPhone} 
                                        onChange={(value) => handleInputChange('pkiPhone', value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nhà mạng</label>
                                    <OrganizationSelect
                                        organizations={networks}
                                        value={formData.pkiNetwork}
                                        onChange={(network) => handleInputChange('pkiNetwork', network?.id)}
                                        placeholder="Chọn nhà mạng"
                                        searchPlaceholder="Tìm kiếm nhà mạng..."
                                    />
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-item">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.showPhoneOnSignature}
                                            onChange={(e) => handleInputChange('showPhoneOnSignature', e.target.checked)}
                                        />
                                        <span>Cho phép hiển thị thông tin SĐT lên chữ ký</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* CHỮ KÝ HSM - 25% */}
                        <div className="signature-column">
                            <h3 className="signature-subtitle">CHỮ KÝ HSM</h3>
                            <div className="signature-form">
                                <div className="form-group">
                                    <label>Nhà cung cấp</label>
                                    <OrganizationSelect
                                        organizations={providers}
                                        value={formData.hsmProvider}
                                        onChange={(provider) => handleInputChange('hsmProvider', provider?.id)}
                                        placeholder="Chọn nhà cung cấp"
                                        searchPlaceholder="Tìm kiếm nhà cung cấp..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>UUID</label>
                                    <SearchBar 
                                        placeholder="Nhập UUID" 
                                        value={formData.hsmUuid} 
                                        onChange={(value) => handleInputChange('hsmUuid', value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="add-user-actions">
                <Button 
                    outlineColor="#6c757d" 
                    backgroundColor="transparent" 
                    text="Hủy bỏ" 
                    onClick={handleCancel}
                />
                <Button 
                    outlineColor="#0B57D0" 
                    backgroundColor="#0B57D0" 
                    text="Lưu lại" 
                    onClick={handleSave}
                />
            </div>
        </div>
    );
};

export default AddNewUser;
