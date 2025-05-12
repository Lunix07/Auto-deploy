import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/form" element={<FormPage />} />

    </Routes>
  </BrowserRouter>
);

export default App;
