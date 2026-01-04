import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import customerService from "../../api/customerService";
import "../../styles/userInforDetail.css";
import OrganizationService from "../../api/OrganizationService";

const UserInforDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [userInfo, setUserInfo] = useState({
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        birthday: "",
        gender: "",
        status: null,
        taxCode: "",
        organizationId: null,
        organizationName: "",
        roleId: null,
        roleName: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        birthday: "",
        gender: "",
        taxCode: "",
    });

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerService.getCustomerByToken();

            if (response && response.data) {
                const u = response.data;
                const role = u.roles?.[0] || {};
                const responeOrganization = await OrganizationService.getById(u.organizationId);

                setUserInfo({
                    id: u.id,
                    name: u.name || "",
                    email: u.email || "",
                    phone: u.phone || "",
                    address: u.address || "",
                    birthday: u.birthday || "",
                    gender: u.gender || "",
                    status: u.status,
                    taxCode: u.taxCode || "",
                    organizationId: u.organizationId,
                    organizationName: responeOrganization.data.name || "",
                    roleId: role.id || null,
                    roleName: role.name || "",
                });

                setFormData({
                    name: u.name || "",
                    email: u.email || "",
                    phone: u.phone || "",
                    address: u.address || "",
                    birthday: u.birthday || "",
                    gender: u.gender || "",
                    taxCode: u.taxCode || "",
                });

                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    localStorage.setItem("user", JSON.stringify({
                        ...parsedUser,
                        name: u.name,
                        phone: u.phone
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching user info:", err);
            setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError(null);
        setSuccessMessage("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            address: userInfo.address,
            birthday: userInfo.birthday,
            gender: userInfo.gender,
            taxCode: userInfo.taxCode
        });
        setError(null);
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Tên không được để trống");
            return;
        }
        if (!formData.email.trim()) {
            setError("Email không được để trống");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage("");

            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                birthday: formData.birthday,
                gender: formData.gender,
                taxCode: formData.taxCode,
            };

            const response = await customerService.updateCustomer(userInfo.id, updateData);

            if (response) {
                setSuccessMessage("Cập nhật thông tin thành công!");
                setIsEditing(false);
                await fetchUserInfo();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            console.error("Error updating user info:", err);
            setError(err.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const getUserInitial = () => {
        const name = userInfo.name || "";
        return name.trim() ? name.charAt(0).toUpperCase() : "U";
    };

    if (loading && !userInfo.id) {
        return (
            <div className="user-infor-detail">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-infor-detail">
            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage("")}>×</button>
                </div>
            )}

            <div className="user-infor-content">
                <div className="user-avatar-section">
                    <div className="user-avatar-large">{getUserInitial()}</div>
                    <div className="user-basic-info">
                        <h3>{userInfo.name || "Chưa có tên"}</h3>
                        <p className="user-email">{userInfo.email}</p>
                        {userInfo.roleName && (
                            <span className="user-role-badge">{userInfo.roleName}</span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="user-info-form">
                    {/* ✨ Thông tin cá nhân - Grid 2 cột */}
                    <div className="form-section">
                        <div className="form-grid">
                            <div className="form-group-user-infor">
                                <label>Họ và tên <span className="required">*</span></label>
                                {isEditing ? (
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.name || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Email <span className="required">*</span></label>
                                {isEditing ? (
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.email || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Số điện thoại</label>
                                {isEditing ? (
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.phone || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Ngày sinh</label>
                                {isEditing ? (
                                    <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.birthday || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Giới tính</label>
                                {isEditing ? (
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                ) : (
                                    <p className="form-value">
                                        {userInfo.gender === "male"
                                            ? "Nam"
                                            : userInfo.gender === "female"
                                                ? "Nữ"
                                                : userInfo.gender === "other"
                                                    ? "Khác"
                                                    : "Chưa cập nhật"}
                                    </p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Mã số thuế</label>
                                {isEditing ? (
                                    <input type="text" name="taxCode" value={formData.taxCode} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.taxCode || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor form-group-full">
                                <label>Địa chỉ</label>
                                {isEditing ? (
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                                ) : (
                                    <p className="form-value">{userInfo.address || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group-user-infor">
                                <label>Trạng thái</label>
                                <p className="form-value">
                                    {userInfo.status === 1 ? "Hoạt động" : "Không hoạt động"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ✨ Thông tin tổ chức - Grid 2 cột */}
                    <div className="form-section">
                        <h3>Thông tin tổ chức</h3>
                        <div className="form-grid">
                            <div className="form-group-user-infor">
                                <label>Tổ chức</label>
                                <p className="form-value">{userInfo.organizationName || "Chưa có tổ chức"}</p>
                            </div>

                            <div className="form-group-user-infor">
                                <label>Vai trò</label>
                                <p className="form-value">{userInfo.roleName || "Chưa có vai trò"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        {!isEditing ? (
                            <button type="button" className="btn btn-primary" onClick={handleEdit}>
                                Chỉnh sửa thông tin
                            </button>
                        ) : (
                            <>
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserInforDetail;