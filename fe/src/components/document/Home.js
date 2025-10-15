import Header from "../bar/Header";
import Sidebar from "../bar/SideBar";
import WelcomeComponent from "../common/welcome";
function HomeComponent() {
    return (
        <div className="home-content">
            <WelcomeComponent />
        </div>
    );
}

export default HomeComponent;