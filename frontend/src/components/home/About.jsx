import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  return (
    <section id="about" className="section light">
      <div className="container">
        <div className="about-content reveal">
          <h2>About Our Hospital</h2>
          <p className="section-sub">
            MediCare+ is a premier multi-speciality hospital network delivering world-class
            healthcare with expert doctors and modern technology. Our facilities are equipped
            with high-resolution imaging and modern surgical suites to ensure precision.
          </p>
          <a href="/infrastructure" className="btn outline" onClick={(e) => { e.preventDefault(); navigate('/infrastructure'); }}>Learn More About Our Tech</a>
        </div>
      </div>
    </section>
  );
};

export default About;
