import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';
import authService from '../../api/authService';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {

            const response = await authService.login({ email, password });

            const accessToken = response?.data?.access_token;

            if (accessToken) {
                sessionStorage.setItem('token', accessToken);
                localStorage.setItem('token', accessToken);
            }

            console.log('Đăng nhập thành công', response);


            navigate('/main/dashboard');
        } catch (err) {
            console.error('Login error:', err);

            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="main-login-container">
            <div className="container" id="container">
                <div className="form-container login-container">
                    <form onSubmit={handleLogin}>
                        <h1>Login</h1>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="content">
                            <div className="checkbox">
                                <input type="checkbox" name="checkbox" id="checkbox" />
                                <label htmlFor="checkbox">Remember me</label>
                            </div>
                            <div className="pass-link">
                                <a href="#">Forgot Password?</a>
                            </div>
                        </div>
                        <button type="submit">Login</button>

                        <div className="register-link">
                            <div className="pass-link">
                                <a href="/register">Register</a>
                                <span> or use your account</span>
                            </div>
                        </div>

                        <div className="social-container">
                            <a href="#" className="social">
                                <i className="lni lni-google"></i>
                            </a>
                            <a href="#" className="social hover:text-blue-500">
                                <i className="lni lni-microsoft"></i>
                            </a>
                        </div>
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

export default Login;
