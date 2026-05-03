import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyOtp } from '../services/api';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize reCAPTCHA on component mount
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Enter valid name & 10-digit phone number");
      return;
    }

    try {
      const formattedPhone = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setMessage('OTP Sent to your phone via Firebase!');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP via Firebase. Check console.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim()) {
      setError("Enter OTP");
      return;
    }

    try {
      // 1. Verify OTP with Firebase directly
      await confirmationResult.confirm(otp);
      
      // 2. If Firebase succeeds, register/login user in MongoDB
      const user = await verifyOtp(name, phone, role);
      login(user);
      
      if (user.role === 'nurse') {
        navigate('/nurse-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Try again.");
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-card" style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', marginTop: '10vh', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#0d47a1', fontSize: '2rem' }}>MediCare<span style={{ color: '#ff4081' }}>+</span></h1>
          <p style={{ color: '#666' }}>{step === 1 ? 'Sign in to your account' : 'Verify your phone'}</p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <p style={{ color: 'red', textAlign: 'center', margin: 0 }}>{error}</p>}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder=" " />
              <label>Full Name</label>
            </div>
            
            <div className="input-group">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} pattern="[6-9][0-9]{9}" required placeholder=" " />
              <label>Phone Number</label>
            </div>
            
            <div id="recaptcha-container"></div>
            
            <button type="submit" className="btn" style={{ width: '100%' }}>Request OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {message && <p style={{ color: 'green', textAlign: 'center', margin: 0, fontSize: '0.9rem' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', margin: 0 }}>{error}</p>}
            
            <div className="input-group">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder=" " />
              <label>Enter OTP</label>
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%' }}>Verify & Login</button>
            <button type="button" onClick={() => setStep(1)} className="btn outline" style={{ width: '100%', marginTop: '-0.5rem' }}>Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
