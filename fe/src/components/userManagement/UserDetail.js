import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/addNewUser.css';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import OrganizationSelect from '../common/OrganizationSelect';
import customerService from '../../api/customerService';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        birthDate: '',
        phone: '',
        organization: null,
        role: null,
        loginMethod: 'email',
        accountStatus: 1,
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const networks = [
        { id: 1, name: 'Viettel' },
        { id: 2, name: 'MobiFone' },
        { id: 3, name: 'Vinaphone' }
    ];

    const providers = [
        { id: 1, name: 'CA Viettel' },
        { id: 2, name: 'CA MobiFone' },
        { id: 3, name: 'CA Vinaphone' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [userRes, orgRes, roleRes] = await Promise.all([
                    customerService.getCustomerById(id),
                    customerService.getAllOrganizations({ page: 0, size: 1000 }),
                    customerService.getAllRoles({ page: 0, size: 1000 })
                ]);

                if (userRes.code === 'SUCCESS') {
                    const user = userRes.data;
                    setFormData({
                        fullName: user.name || '',
                        email: user.email || '',
                        birthDate: user.birthday || '',
                        phone: user.phone || '',
                        organization: user.organizationId || user.organization?.id || null,
                        role: user.roleId || user.role?.id || null,
                        loginMethod: user.loginMethod || 'email',
                        accountStatus: user.status ?? 1,
                        smsSignatureImage: null,
                        digitalSignatureImage: null,
                        pkiPhone: '',
                        pkiNetwork: null,
                        showPhoneOnSignature: true,
                        hsmProvider: null,
                        hsmUuid: ''
                    });
                } else {
                    setError('Không thể tải thông tin người dùng');
                }

                if (orgRes.code === 'SUCCESS') {
                    const list = orgRes.data?.content || [];
                    const flat = [];
                    const walk = (arr) => {
                        arr.forEach((o) => {
                            flat.push({ id: o.id, name: o.name });
                            if (o.children && o.children.length) walk(o.children);
                        });
                    };
                    walk(list);
                    setOrganizations(flat);
                }

                if (roleRes.code === 'SUCCESS') {
                    const rolesContent = roleRes.data?.content || [];
                    setRoles(rolesContent.map((r) => ({ id: r.id, name: r.name })));
                }
            } catch (e) {
                setError(e.message || 'Đã xảy ra lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="user-management-container">
                <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-management-container">
                <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="#0B57D0"
                        text="Quay lại"
                        onClick={() => navigate('/main/user')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="add-user-content">
                <div className="section">
                    <h2 className="section-title">CHI TIẾT THÔNG TIN NGƯỜI DÙNG</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Họ tên</label>
                            <SearchBar
                                placeholder="Họ tên"
                                value={formData.fullName}
                                onChange={() => {}}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <SearchBar
                                placeholder="Email"
                                value={formData.email}
                                onChange={() => {}}
                                type="email"
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <div className="date-input-group">
                                <SearchBar
                                    placeholder="dd/MM/yyyy"
                                    value={formData.birthDate}
                                    onChange={() => {}}
                                    disabled
                                />
                                <button type="button" className="calendar-btn" disabled>📅</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <SearchBar
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={() => {}}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Tổ chức</label>
                            <OrganizationSelect
                                organizations={organizations}
                                value={formData.organization}
                                onChange={() => {}}
                                placeholder="Tổ chức"
                                searchPlaceholder="Tìm kiếm tổ chức..."
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Vai trò</label>
                            <OrganizationSelect
                                organizations={roles}
                                value={formData.role}
                                onChange={() => {}}
                                placeholder="Vai trò"
                                searchPlaceholder="Tìm kiếm vai trò..."
                                disabled
                            />
                        </div>
                    </div>

                    <div className="radio-sections">
                        <div className="radio-section">
                            <label className="radio-section-label">Hình thức đăng nhập:</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="loginMethod"
                                        value="email"
                                        checked={formData.loginMethod === 'email'}
                                        disabled
                                        readOnly
                                    />
                                    <span>Đăng nhập bằng email</span>
                                </label>
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="loginMethod"
                                        value="phone"
                                        checked={formData.loginMethod === 'phone'}
                                        disabled
                                        readOnly
                                    />
                                    <span>Đăng nhập bằng số điện thoại</span>
                                </label>
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="loginMethod"
                                        value="both"
                                        checked={formData.loginMethod === 'both'}
                                        disabled
                                        readOnly
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
                                        disabled
                                        readOnly
                                    />
                                    <span>Hoạt động</span>
                                </label>
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="accountStatus"
                                        value="0"
                                        checked={formData.accountStatus === 0}
                                        disabled
                                        readOnly
                                    />
                                    <span>Không hoạt động</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h2 className="section-title">THÔNG TIN CHỮ KÝ</h2>

                    <div className="signature-grid">
                        <div className="signature-column">
                            <h3 className="signature-subtitle">HÌNH ẢNH CHỮ KÝ HÌNH THỨC SMS OTP</h3>
                            <div className="image-upload-area" style={{ opacity: 0.6 }}>
                                <p className="upload-instruction">Không có dữ liệu</p>
                            </div>
                        </div>

                        <div className="signature-column">
                            <h3 className="signature-subtitle">HÌNH ẢNH CHỮ KÝ/CON DẤU KÝ SỐ</h3>
                            <div className="image-upload-area" style={{ opacity: 0.6 }}>
                                <p className="upload-instruction">Không có dữ liệu</p>
                            </div>
                        </div>

                        <div className="signature-column">
                            <h3 className="signature-subtitle">CHỮ KÝ PKI</h3>
                            <div className="signature-form">
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <SearchBar
                                        placeholder="Số điện thoại"
                                        value={formData.pkiPhone}
                                        onChange={() => {}}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nhà mạng</label>
                                    <OrganizationSelect
                                        organizations={networks}
                                        value={formData.pkiNetwork}
                                        onChange={() => {}}
                                        placeholder="Nhà mạng"
                                        disabled
                                    />
                                </div>
                                <div className="checkbox-group">
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.showPhoneOnSignature}
                                            disabled
                                            readOnly
                                        />
                                        <span>Cho phép hiển thị thông tin SĐT lên chữ ký</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="signature-column">
                            <h3 className="signature-subtitle">CHỮ KÝ HSM</h3>
                            <div className="signature-form">
                                <div className="form-group">
                                    <label>Nhà cung cấp</label>
                                    <OrganizationSelect
                                        organizations={providers}
                                        value={formData.hsmProvider}
                                        onChange={() => {}}
                                        placeholder="Nhà cung cấp"
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label>UUID</label>
                                    <SearchBar
                                        placeholder="UUID"
                                        value={formData.hsmUuid}
                                        onChange={() => {}}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="add-user-actions">
                <Button
                    outlineColor="#0B57D0"
                    backgroundColor="#0B57D0"
                    text="Quay lại"
                    onClick={() => navigate('/main/user')}
                />
            </div>
        </div>
    );
};

export default UserDetail;

