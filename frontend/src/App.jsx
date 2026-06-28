import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Chatbot from './components/Chatbot';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'));
const DoctorDetailsPage = lazy(() => import('./pages/DoctorDetailsPage'));
const ManageDoctorsPage = lazy(() => import('./pages/ManageDoctorsPage'));
const InfrastructurePage = lazy(() => import('./pages/InfrastructurePage'));
const NurseDashboard = lazy(() => import('./pages/NurseDashboard'));
const UserReportsPage = lazy(() => import('./pages/UserReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0d6efd', fontSize: '1.2rem', fontWeight: 'bold' }}>Loading MediCare+...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<HomePage />} />
            <Route path="/services" element={<HomePage />} />
            <Route path="/doctors" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/doctor/:name" element={<DoctorDetailsPage />} />
            <Route path="/manage-doctors" element={<ManageDoctorsPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/nurse-dashboard" element={<NurseDashboard />} />
            <Route path="/reports" element={<UserReportsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;


