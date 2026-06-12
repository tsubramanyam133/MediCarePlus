import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendForgotPasswordOtp, resetPassword } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await sendForgotPasswordOtp(email);
      setMessage('Password reset OTP has been sent to your Gmail inbox! Check notifications.');
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send reset verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!otp.trim() || !newPassword.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      alert('Password reset successful! You can now log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.message || "Verification failed. Please check the OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MediCare<span>+</span></h1>
          <p>{step === 1 ? 'Reset Password' : 'Verify & Set New Password'}</p>
        </div>

        {error && <p style={{ color: '#c62828', textAlign: 'center', margin: '0 0 1rem 0', background: '#ffebee', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</p>}
        {message && <p style={{ color: '#2e7d32', textAlign: 'center', margin: '0 0 1rem 0', background: '#e8f5e9', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
              <label>Email Address (Gmail)</label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>

            <p className="auth-note">
              Remembered your password? <Link to="/login">Login here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="input-group">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder=" " maxLength="6" />
              <label>Enter 6-Digit OTP</label>
            </div>

            <div className="input-group">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder=" " />
              <label>New Password</label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="auth-btn" style={{ background: '#6c757d', marginTop: '-0.5rem' }} disabled={loading}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
