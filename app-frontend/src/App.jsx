import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import LocationPrompt from './pages/LocationPrompt';
import Login from './pages/Login';
import OTP from './pages/OTP';
import Dashboard from './pages/Dashboard';
import './index.css';

// Redirect logged-in users away from auth pages
const AuthRoute = ({ children }) => {
  const { token, role } = useAuth();
  if (token && role) return <Navigate to="/dashboard" replace />;
  return children;
};

// Protect dashboard from unauthenticated access
const ProtectedRoute = ({ children }) => {
  const { token, role } = useAuth();
  if (!token || !role) return <Navigate to="/welcome" replace />;
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl">
      <Routes>
        <Route path="/welcome" element={<AuthRoute><Welcome /></AuthRoute>} />
        <Route path="/location" element={<LocationPrompt />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}

// Smart home redirect based on auth state
const HomeRedirect = () => {
  const { token, role } = useAuth();
  if (token && role) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/welcome" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
