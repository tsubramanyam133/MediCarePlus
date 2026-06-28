import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section id="home" className="hero">
      <div className="hero-text">
        <h1>Your Health, Our Priority</h1>
        <p>Advanced medical care with compassion and trust.</p>
        <a href="/appointment" className="btn small" onClick={(e) => { e.preventDefault(); navigate('/appointment'); }}>Book Appointment</a>
      </div>
    </section>
  );
};

export default Hero;
