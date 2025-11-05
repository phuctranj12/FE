import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/addNewUser.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import OrganizationSelect from '../common/OrganizationSelect';
import customerService from '../../api/customerService';

const AddNewUser = ({ onCancel, mode = 'create', initialUser = null }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: null,
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

    const [organizations, setOrganizations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toasts, setToasts] = useState([]);

    const showToast = (message, variant = 'error', durationMs = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const flattenOrganizations = (orgs, acc = []) => {
        if (!Array.isArray(orgs)) return acc;
        orgs.forEach((org) => {
            acc.push({ id: org.id, name: org.name });
            if (org.children && org.children.length) {
                flattenOrganizations(org.children, acc);
            }
        });
        return acc;
    };

    const didInit = useRef(false);

    // Prefill when in edit mode - from initialUser or fetch by ID
    useEffect(() => {
        if (mode !== 'edit') return;
        
        const loadUserData = async () => {
            if (id && !initialUser) {
                // Fetch user data by ID from route params
                try {
                    setLoading(true);
                    const res = await customerService.getCustomerById(id);
                    if (res.code === 'SUCCESS') {
                        const user = res.data;
                        // Get role ID from roles array (take first role if multiple)
                        const roleId = user.roleId ?? user.role?.id ?? 
                            (Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0].id : null);
                        setFormData(prev => ({
                            ...prev,
                            id: user.id ?? null,
                            fullName: user.name ?? '',
                            email: user.email ?? '',
                            birthDate: user.birthday ?? '',
                            phone: user.phone ?? '',
                            organization: user.organizationId ?? user.organization?.id ?? null,
                            role: roleId,
                            loginMethod: user.loginMethod ?? 'email',
                            accountStatus: user.status ?? 1
                        }));
                    } else {
                        showToast('Không thể tải thông tin người dùng');
                    }
                } catch (e) {
                    showToast(e.message || 'Lỗi tải dữ liệu người dùng');
                } finally {
                    setLoading(false);
                }
            } else if (initialUser) {
                // Use provided initialUser
                // Get role ID from roles array (take first role if multiple)
                const roleId = initialUser.roleId ?? initialUser.role?.id ?? 
                    (Array.isArray(initialUser.roles) && initialUser.roles.length > 0 ? initialUser.roles[0].id : null);
                setFormData(prev => ({
                    ...prev,
                    id: initialUser.id ?? null,
                    fullName: initialUser.name ?? '',
                    email: initialUser.email ?? '',
                    birthDate: initialUser.birthday ?? '',
                    phone: initialUser.phone ?? '',
                    organization: initialUser.organizationId ?? initialUser.organization?.id ?? null,
                    role: roleId,
                    loginMethod: initialUser.loginMethod ?? 'email',
                    accountStatus: initialUser.status ?? 1
                }));
            }
        };
        
        loadUserData();
    }, [mode, initialUser, id]);

    useEffect(() => {
        if (didInit.current) return; // Prevent double call in React StrictMode (dev)
        didInit.current = true;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [orgSettled, roleSettled] = await Promise.allSettled([
                    customerService.getAllOrganizations({ page: 0, size: 1000 }),
                    customerService.getAllRoles({ page: 0, size: 1000 })
                ]);

                // Organizations
                if (orgSettled.status === 'fulfilled') {
                    const orgRes = orgSettled.value;
                    if (orgRes.code === 'SUCCESS') {
                        const flatOrgs = flattenOrganizations(orgRes.data?.content || []);
                        setOrganizations(flatOrgs);
                    } else {
                        console.error('Load organizations failed:', orgRes.message);
                        showToast(orgRes.message || 'Không thể tải danh sách tổ chức');
                    }
                } else {
                    console.error('Load organizations error:', orgSettled.reason);
                    showToast('Không thể tải danh sách tổ chức');
                }

                // Roles
                if (roleSettled.status === 'fulfilled') {
                    const roleRes = roleSettled.value;
                    if (roleRes.code === 'SUCCESS') {
                        const rolesContent = roleRes.data?.content || [];
                        setRoles(rolesContent.map(r => ({ id: r.id, name: r.name })));
                    } else {
                        console.error('Load roles failed:', roleRes.message);
                        showToast(roleRes.message || 'Không thể tải danh sách vai trò');
                    }
                } else {
                    console.error('Load roles error:', roleSettled.reason);
                    showToast('Không thể tải danh sách vai trò');
                }
            } catch (e) {
                console.error('Fetch data error:', e);
                showToast(e.message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const handleSave = async () => {
        // Validate required fields
        const requireEmail = mode !== 'edit';
        if (!formData.fullName || (requireEmail && !formData.email) || !formData.phone || !formData.organization || !formData.role) {
            showToast('Vui lòng điền đầy đủ các trường bắt buộc (*)', 'warning');
            return;
        }

        const payload = {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            birthday: formData.birthDate || '',
            organizationId: formData.organization,
            status: formData.accountStatus,
            roleId: formData.role,
            // Some backends may require taxCode; send empty if not available
            taxCode: ''
        };

        try {
            setLoading(true);
            const res = mode === 'edit' && formData.id
                ? await customerService.updateCustomer(formData.id, payload)
                : await customerService.createCustomer(payload);
            if (res.code === 'SUCCESS') {
                showToast(
                    mode === 'edit' ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công', 
                    'success',
                    3000 // Hiển thị 3 giây để user thấy toast
                );
                // Delay đóng form để user có thể thấy toast
                setTimeout(() => {
                    onCancel && onCancel();
                }, 500);
            } else {
                showToast((mode === 'edit' ? 'Không thể cập nhật người dùng: ' : 'Không thể tạo người dùng: ') + (res.message || 'Unknown error'), 'error');
            }
        } catch (e) {
            showToast(e.response?.data?.message || e.message || 'Đã xảy ra lỗi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel && onCancel();
    };

    return (
        <div className="user-management-container">
            {!!toasts.length && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {toasts.map((t) => (
                        <div 
                            key={t.id} 
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
                                borderRadius: 8,
                                color: t.variant === 'success' ? '#0a3622' : t.variant === 'warning' ? '#664d03' : '#842029',
                                background: t.variant === 'success' ? '#d1e7dd' : t.variant === 'warning' ? '#fff3cd' : '#f8d7da',
                                border: `1px solid ${t.variant === 'success' ? '#a3cfbb' : t.variant === 'warning' ? '#ffecb5' : '#f5c2c7'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <span style={{ flex: 1 }}>{t.message}</span>
                            <button
                                onClick={() => removeToast(t.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    marginLeft: 12,
                                    padding: 0,
                                    color: 'inherit',
                                    opacity: 0.7,
                                    lineHeight: 1
                                }}
                                aria-label="Close toast"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            

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
                                disabled={mode === 'edit'}
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
