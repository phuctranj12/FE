

import Login from './components/login/login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/register/register';

function App() {



  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>

  );
}

export default App;
