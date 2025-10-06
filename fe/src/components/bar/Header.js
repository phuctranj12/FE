
import "../../styles/header.css";

function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <img src="/logo.png" alt="Logo" className="logo" />
                <span className="header-title">DANH SÁCH TÀI LIỆU ĐÃ TẠO ▸ BẢN NHÁP</span>
            </div>
            <div className="header-right">
                <button className="lang">VI ▼</button>
                <button className="bell">🔔</button>
                <div className="user-info">
                    <span className="name">Nguyễn Quang Minh</span>
                    <span className="phone">0357631601</span>
                </div>
            </div>
        </header>
    );
}

export default Header;