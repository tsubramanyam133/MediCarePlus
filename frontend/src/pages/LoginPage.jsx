import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      setLoading(false);
      return;
    }

    try {
      const user = await loginUser(email, password);
      login(user);
      
      if (user.role === 'nurse') {
        navigate('/nurse-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MediCare<span>+</span></h1>
          <p>Sign in to your account</p>
        </div>
        
        {error && <p style={{ color: '#c62828', textAlign: 'center', margin: '0 0 1.5rem 0', background: '#ffebee', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
            <label>Email Address</label>
          </div>
          
          <div className="input-group" style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder=" " 
              style={{ paddingRight: '2.5rem' }}
            />
            <label>Password</label>
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-0.8rem', marginBottom: '0.5rem' }}>
            <Link to="/forgot-password" style={{ color: '#0d6efd', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Verify & Login'}
          </button>

          <p className="auth-note">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

