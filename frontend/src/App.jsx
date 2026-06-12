import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AppointmentPage from './pages/AppointmentPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import InfrastructurePage from './pages/InfrastructurePage';
import NurseDashboard from './pages/NurseDashboard';
import UserReportsPage from './pages/UserReportsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/doctor/:name" element={<DoctorDetailsPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/reports" element={<UserReportsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

