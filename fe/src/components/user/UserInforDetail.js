import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import customerService from "../../api/customerService";
import "../../styles/userInforDetail.css";

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
        organizationId: null,
        roleId: null
    });

    // Lấy thông tin user từ token
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerService.getCustomerByToken();

            if (response && response.data) {
                const userData = response.data;
                setUserInfo({
                    id: userData.id,
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    organizationId: userData.organizationId,
                    organizationName: userData.organizationName || "",
                    roleId: userData.roleId,
                    roleName: userData.roleName || ""
                });

                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    organizationId: userData.organizationId,
                    roleId: userData.roleId
                });

                // Cập nhật localStorage
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    localStorage.setItem("user", JSON.stringify({
                        ...parsedUser,
                        name: userData.name,
                        phone: userData.phone
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
            organizationId: userInfo.organizationId,
            roleId: userInfo.roleId
        });
        setError(null);
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
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
                organizationId: formData.organizationId,
                roleId: formData.roleId
            };

            const response = await customerService.updateCustomer(userInfo.id, updateData);

            if (response) {
                setSuccessMessage("Cập nhật thông tin thành công!");
                setIsEditing(false);

                // Refresh thông tin
                await fetchUserInfo();

                // Tự động ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
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
            <div className="user-infor-header">
                <h2>Thông tin tài khoản</h2>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <span>✓ {successMessage}</span>
                    <button onClick={() => setSuccessMessage("")}>×</button>
                </div>
            )}

            <div className="user-infor-content">
                <div className="user-avatar-section">
                    <div className="user-avatar-large">
                        {getUserInitial()}
                    </div>
                    <div className="user-basic-info">
                        <h3>{userInfo.name || "Chưa có tên"}</h3>
                        <p className="user-email">{userInfo.email}</p>
                        {userInfo.roleName && (
                            <span className="user-role-badge">{userInfo.roleName}</span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="user-info-form">
                    <div className="form-section">
                        <h3>Thông tin cá nhân</h3>

                        <div className="form-group">
                            <label htmlFor="name">
                                Họ và tên <span className="required">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            ) : (
                                <p className="form-value">{userInfo.name || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Nhập email"
                                    required
                                />
                            ) : (
                                <p className="form-value">{userInfo.email || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <p className="form-value">{userInfo.phone || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ</label>
                            {isEditing ? (
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ"
                                    rows="3"
                                />
                            ) : (
                                <p className="form-value">{userInfo.address || "Chưa cập nhật"}</p>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Thông tin tổ chức</h3>

                        <div className="form-group">
                            <label>Tổ chức</label>
                            <p className="form-value">{userInfo.organizationName || "Chưa có tổ chức"}</p>
                        </div>

                        <div className="form-group">
                            <label>Vai trò</label>
                            <p className="form-value">{userInfo.roleName || "Chưa có vai trò"}</p>
                        </div>
                    </div>

                    <div className="form-actions">
                        {!isEditing ? (
                            <button type="button" className="btn btn-primary" onClick={handleEdit}>
                                ✏️ Chỉnh sửa thông tin
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
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