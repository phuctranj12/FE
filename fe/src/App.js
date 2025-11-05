

import Login from './components/login/login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/register/register';
import MainContent from './views/MainContent';
import DashboardHome from './components/dashboard/DashboardHome';
import OrganizationList from './components/userManagement/OrganizationList';
import UserList from './components/userManagement/UserList';
import UserDetail from './components/userManagement/UserDetail';
import AddNewUser from './components/userManagement/AddNewUser';
import RoleList from './components/userManagement/RoleList';

function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainContent />}>
        <Route path="main/dashboard" element={<DashboardHome />} />
        <Route path="main/org" element={<OrganizationList />} />
        <Route path="main/user" element={<UserList />} />
        <Route path="main/user-detail/:id" element={<UserDetail />} />
        <Route path="main/form-user/add" element={<AddNewUser onCancel={() => window.history.back()} mode="create" />} />
        <Route path="main/form-user/edit/:id" element={<AddNewUser onCancel={() => window.history.back()} mode="edit" />} />
        <Route path="main/role" element={<RoleList />} />
      </Route>
    </Routes>
  );
}

export default App;
