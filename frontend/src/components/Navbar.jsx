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

  const handleHashClick = (e, targetId) => {
    e.preventDefault();
    setMenuActive(false);
    navigate(`/${targetId}`);
    
    // Remove timeout and scroll immediately if element exists
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback if lazy-loaded
      requestAnimationFrame(() => {
        const lazyEl = document.getElementById(targetId);
        if (lazyEl) lazyEl.scrollIntoView({ behavior: 'smooth' });
      });
    }
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
        <Link to="/home" className="logo-container" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.jpg" alt="MediCare+ Logo" className="nav-logo" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div className="logo-text" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>MediCare<span style={{ color: '#ffe600' }}>+</span></div>
        </Link>

        <div className={`hamburger ${menuActive ? 'active' : ''}`} id="hamburger" onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </div>

          <nav className={`nav-menu ${menuActive ? 'active' : ''}`} id="navMenu">
          <Link to="/home" onClick={() => setMenuActive(false)}>Home</Link>
          <a href="/" onClick={(e) => handleHashClick(e, 'about')}>About</a>
          <a href="/" onClick={(e) => handleHashClick(e, 'services')}>Services</a>
          <a href="/" onClick={(e) => handleHashClick(e, 'doctors')}>Doctors</a>
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
                <img 
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username || user.name}&mouth=smile`} 
                  alt="Profile" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '8px', border: '2px solid white', objectFit: 'cover', background: '#e0e0e0' }} 
                />
                <strong><span id="profileName">{user.username || user.name}</span></strong>
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
