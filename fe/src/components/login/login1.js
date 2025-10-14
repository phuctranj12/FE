import '../../styles/login.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { MsalProvider, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import React from "react";

// Khởi tạo MSAL cho Microsoft login
const msalInstance = new PublicClientApplication({
    auth: {
        clientId: "YOUR_MICROSOFT_CLIENT_ID", // Thay bằng clientId của bạn
        redirectUri: "http://localhost:3000", // Đổi theo domain của bạn
    },
});

function MicrosoftLoginButton() {
    const { instance } = useMsal();
    const handleLogin = () => {
        instance.loginPopup().then((response) => {
            // Xử lý đăng nhập thành công
            console.log(response);
            // Gọi API backend xác thực hoặc lưu token
        });
    };
    return (
        <button type="button" className="social" onClick={handleLogin}>
            <i className="lni lni-microsoft"></i> Đăng nhập Microsoft
        </button>
    );
}

function Login() {
    const handleGoogleLoginSuccess = (credentialResponse) => {
        // Xử lý đăng nhập thành công, credentialResponse chứa token
        console.log(credentialResponse);
        // Gọi API backend xác thực hoặc lưu token
    };

    return (
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">{/* Thay bằng clientId của bạn */}
            <MsalProvider instance={msalInstance}>
                <div className="main-login-container">
                    <div className="container" id="container">
                        <div className="form-container login-container">
                            <form>
                                <h1>Login</h1>
                                <input type="text" placeholder="Email" id="email" name="email" required />
                                <input type="password" placeholder="Password" id="password" name="password" required />
                                <div className="content">
                                    <div className="checkbox">
                                        <input type="checkbox" name="checkbox" id="checkbox" />
                                        <label htmlFor="checkbox">Remember me</label>
                                    </div>
                                    <div className="pass-link">
                                        <a href="#">Forgot Password?</a>
                                    </div>
                                </div>
                                <button name="submitLogin" type="submit">Login</button>
                                <div className="register-link">
                                    <div className="pass-link">
                                        <a href="/register">Register </a>
                                        <span>or use your account</span>
                                    </div>
                                </div>
                                <div className="social-container" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleLoginSuccess}
                                        onError={() => {
                                            console.log('Google Login Failed');
                                        }}
                                    />
                                    <MicrosoftLoginButton />
                                </div>
                            </form>
                        </div>
                        <div className="overlay-container">
                            <div className="overlay">
                                <div className="overlay-panel overlay-right">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MsalProvider>
        </GoogleOAuthProvider>
    );
}

export default Login;