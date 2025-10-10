import Header from "../components/bar/Header";
import Sidebar from "../components/bar/SideBar";
function HomeContent() {
    return (
        <div className="home-content">
            <Header />
            <Sidebar />
            <h2>Welcome to the Document Management System</h2>
            <p>Select a category from the sidebar to view documents.</p>
        </div>
    );
}

export default HomeContent;