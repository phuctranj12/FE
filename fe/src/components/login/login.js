import '../../styles/login.css';
function Login() {
    return (
        <div class="main-login-container">
            <div class="container" id="container">
                <div class="form-container login-container">
                    <form action="index.jsp" method="POST">
                        <h1>Login</h1>
                        <input type="text" placeholder="Email" id="email" name="email" required />
                        <input type="password" placeholder="Password" id="password" name="password" required />
                        <div class="content">
                            <div class="checkbox">
                                <input type="checkbox" name="checkbox" id="checkbox" />
                                <label for="Remember me">Remember me</label>
                            </div>
                            <div class="pass-link">
                                <a href="#">Forgot Password?</a>
                            </div>
                        </div>
                        <button name="submitLogin" type="submit">Login</button>
                        <div className='register-link'>
                            <div class="pass-link">
                                <a href="/register">Register  </a>
                                <span>or use your acount</span>
                            </div>

                        </div>

                        <div class="social-container">
                            <a href="#" class="social"><i class="lni lni-google"></i></a>
                            <a href="#" className="social hover:text-blue-500">
                                <i className="lni lni-microsoft"></i>
                            </a>
                        </div>
                    </form>
                </div>
                <div class="overlay-container">
                    <div class="overlay">
                        <div class="overlay-panel overlay-right">
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default Login;