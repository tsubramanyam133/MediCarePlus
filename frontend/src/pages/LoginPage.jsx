import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
          
          <div className="input-group">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder=" " />
            <label>Password</label>
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

