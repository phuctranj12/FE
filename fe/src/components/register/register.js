import '../../styles/login.css';
function Register() {
    return (
        <div class="main-login-container">
            <div class="container" id="container">
                <div class="form-container register-container">
                    <form action="" method="POST">
                        <h1>Refgister</h1>
                        <input type="text" placeholder="Full Name" id="fullName" name="fullName" required />
                        <input type="email" placeholder="Email" id="email" name="email" required />
                        <input type="tel" placeholder="PhoneNumber" id="phoneNumber" name="phoneNumber" required />
                        <input type="password" placeholder="Password" id="password" name="password" required />
                        <input type="confirmPassword" placeholder="Confirm password" id="confirmPassword" name="confirmPassword" required />
                        <div class="pass-link-back-to-login">
                            <a class="pass-link-back-to-login" href="/login">I already have an account</a>
                        </div>
                        <button type="submit" name="submitRegister">Register</button>

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
export default Register;