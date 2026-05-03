import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuActive(!menuActive);
  
  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      logout();
      setLogoutLoading(false);
      setProfileDropdown(false);
      navigate('/login');
    }, 1200);
  };

  return (
    <>
      {logoutLoading && (
        <div id="logoutLoader" className="logout-loader" style={{ display: 'flex' }}>
          <div className="logout-box">
            <div className="logout-spinner"></div>
            <p>Logging out...</p>
          </div>
        </div>
      )}

      <header className="navbar">
        <Link to="/" className="logo-container" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.jpg" alt="MediCare+ Logo" className="nav-logo" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div className="logo-text" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>MediCare<span style={{ color: '#ffe600' }}>+</span></div>
        </Link>

        <div className={`hamburger ${menuActive ? 'active' : ''}`} id="hamburger" onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </div>

          <nav className={`nav-menu ${menuActive ? 'active' : ''}`} id="navMenu">
          <Link to="/" onClick={() => setMenuActive(false)}>Home</Link>
          <a href="/#about" onClick={() => setMenuActive(false)}>About</a>
          <a href="/#services" onClick={() => setMenuActive(false)}>Services</a>
          <a href="/#doctors" onClick={() => setMenuActive(false)}>Doctors</a>
          {user && user.role === 'nurse' && (
            <Link to="/nurse-dashboard" onClick={() => setMenuActive(false)} style={{ color: '#ffeb3b' }}>Dashboard</Link>
          )}
          {user && user.role === 'user' && (
            <Link to="/reports" onClick={() => setMenuActive(false)} style={{ color: '#4caf50' }}>Reports</Link>
          )}
          <Link to="/appointment" className="btn small" onClick={() => setMenuActive(false)}>Appointment</Link>

          {user && (
            <div className="profile-wrapper" id="profileWrapper" style={{ display: 'block' }}>
              <div className="profile-btn" id="profileBtn" onClick={() => setProfileDropdown(!profileDropdown)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
                <span className="icon" style={{ marginRight: '8px' }}>👤</span> 
                <strong><span id="profileName">{user.name}</span></strong>
              </div>

              {profileDropdown && (
                <div className="profile-dropdown show" id="profileDropdown">
                  <button className="logout-btn" onClick={handleLogout}>
                    <img src="/images/logout.png" alt="Logout Icon" className="logout-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Navbar;
