import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '1.5rem' }}>Page Not Found</h2>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn">Return to Home</Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFoundPage;
