

import Login from './components/login/login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/register/register';
import MainContent from './views/MainContent';
import HomeContent from './views/HomeContent';
function App() {



  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/main" element={<MainContent />} />
      <Route path="/" element={<HomeContent />} />
    </Routes>

  );
}

export default App;
