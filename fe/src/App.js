

import Login from './components/login/login';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/register/register';
import MainContent from './views/MainContent';
import DashboardHome from './components/dashboard/DashboardHome';
import OrganizationList from './components/userManagement/OrganizationList';
import UserList from './components/userManagement/UserList';
import UserDetail from './components/userManagement/UserDetail';
import AddNewUser from './components/userManagement/AddNewUser';
import RoleList from './components/userManagement/RoleList';
import DocumentTemplates from './components/templateContract/DocumentTemplates';
import TemplateDetail from './components/templateContract/TemplateDetail';
import DocTypeList from './components/configuration/DocTypeList';
import Document from './components/document/document';
import DocumentStatusRoute from './components/document/DocumentStatusRoute';
import CreatedDocument from './components/document/CreatedDocument';
import CreatedDocumentRoute from './components/document/CreatedDocumentRoute';
import DocumentForm from './components/createContract/DocumentForm';
import ServerCertificateList from './components/certificate/ServerCertificateList';
import ContractDetail from './components/contract_coordinate/ContractDetail';
import EditDocumentForm from './components/document/EditDocumentForm';
import CheckSignDigital from './components/checkSignDigital/CheckSignDigital';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/main/*" element={<MainContent />}>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="contract-template" element={<DocumentTemplates />} />
        <Route path="contract-template/detail/:template_contract_id" element={<TemplateDetail />} />
        <Route path="contract-type" element={<DocTypeList />} />
        <Route path="form-contract/add" element={<DocumentForm />} />
        <Route path="org" element={<OrganizationList />} />
        <Route path="user" element={<UserList />} />
        <Route path="user-detail/:id" element={<UserDetail />} />
        <Route path="form-user/add" element={<AddNewUser onCancel={() => window.history.back()} mode="create" />} />
        <Route path="form-user/edit/:id" element={<AddNewUser onCancel={() => window.history.back()} mode="edit" />} />
        <Route path="role" element={<RoleList />} />
        <Route path="document" element={<Document />} />
        <Route path="contract/create/:filter" element={<DocumentStatusRoute />} />
        <Route path="created-document" element={<CreatedDocument />} />
        <Route path="contract/receive/wait-processing" element={<CreatedDocumentRoute />} />
        <Route path="contract/receive/processed" element={<CreatedDocumentRoute />} />
        <Route path="contract/receive/shared" element={<CreatedDocumentRoute />} />
        <Route path="server-certificate" element={<ServerCertificateList />} />
        <Route path="c/:type/:contractId" element={<ContractDetail />} />
        <Route path="contract/create/:status/:id" element={<EditDocumentForm />} />
        <Route path="check-sign-digital" element={<CheckSignDigital />} />
      </Route>
    </Routes>
  );
}

export default App;
