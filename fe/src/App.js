

import Login from './components/login/login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/register/register';
import MainContent from './views/MainContent';
import HomeComponent from './components/document/Home';
function App() {



  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainContent />} />
    </Routes>

  );
}

export default App;
