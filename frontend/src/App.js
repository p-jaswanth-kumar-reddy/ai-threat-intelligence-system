import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <Router>
      <Routes>

        {/* 🔐 PROTECTED ROUTES */}
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/history" element={isLoggedIn ? <History /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isLoggedIn ? <Analytics /> : <Navigate to="/login" />} />

        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;