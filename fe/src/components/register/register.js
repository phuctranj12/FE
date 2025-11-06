import React, { useState } from 'react';
import '../../styles/login.css';
import authService from '../../api/authService';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            window.alert('Mật khẩu và xác nhận mật khẩu không trùng nhau');
            return;
        }

        try {
            const userData = {
                name,
                email,
                password,
                phone,
                birthday: '',
                gender: '',
                organizationId: 0,
                status: 0,
                taxCode: '',
                roleId: 0
            };

            const response = await authService.register(userData);

            const message = response.data?.message || response.data?.data?.message || 'Đăng ký thất bại';

            if (message === 'Đăng ký tài khoản thành công') {
                window.alert(message);
                window.location.href = '/login';
            } else {
                window.alert(message);
            }

            console.log('Register response:', response);
        } catch (err) {
            console.error('Register error:', err);
            const message = err.response?.data?.data?.message || 'Đăng ký thất bại';
            window.alert(message);
        }
    };

    return (
        <div className="main-login-container">
            <div className="container" id="container">
                <div className="form-container register-container">
                    <form onSubmit={handleRegister}>
                        <h1>Register</h1>

                        <input
                            type="text"
                            placeholder="Họ và tên đầy đủ"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="pass-link-back-to-login">
                            <a className="pass-link-back-to-login" href="/login">
                                I already have an account
                            </a>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-right"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
