import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendRegisterOtp, registerUser } from '../services/api';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [otp, setOtp] = useState('');
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

    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      await sendRegisterOtp(email);
      setMessage('OTP has been sent to your Gmail inbox! Check notifications.');
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code");
      setLoading(false);
      return;
    }

    try {
      await registerUser(username, email, phone, password, role, otp);
      alert('Registration successful! You can now log in.');
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
          <p>{step === 1 ? 'Create an Account' : 'Verify Email Address'}</p>
        </div>

        {error && <p style={{ color: '#c62828', textAlign: 'center', margin: '0 0 1rem 0', background: '#ffebee', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</p>}
        {message && <p style={{ color: '#2e7d32', textAlign: 'center', margin: '0 0 1rem 0', background: '#e8f5e9', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" value="user" checked={role === 'user'} onChange={() => setRole('user')} />
                Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" value="nurse" checked={role === 'nurse'} onChange={() => setRole('nurse')} />
                Nurse
              </label>
            </div>

            <div className="input-group">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder=" " />
              <label>Username</label>
            </div>

            <div className="input-group">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
              <label>Email Address (Gmail)</label>
            </div>

            <div className="input-group">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} pattern="[6-9][0-9]{9}" required placeholder=" " />
              <label>Phone Number</label>
            </div>

            <div className="input-group">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder=" " />
              <label>Password</label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>

            <p className="auth-note">
              Already registered? <Link to="/login">Login here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="input-group">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder=" " maxLength="6" />
              <label>Enter 6-Digit OTP</label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Register'}
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

export default RegisterPage;
