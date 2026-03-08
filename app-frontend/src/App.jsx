import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Welcome from './pages/Welcome';
import LocationPrompt from './pages/LocationPrompt';
import Login from './pages/Login';
import OTP from './pages/OTP';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/location" element={<LocationPrompt />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
