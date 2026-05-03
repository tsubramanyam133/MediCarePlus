import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InfrastructurePage = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => scrollObserver.observe(el));
    return () => scrollObserver.disconnect();
  }, []);

  return (
    <div className="infra-page">
      <Navbar />

      <section className="infra-hero-modern">
        <div className="container reveal">
          <h1>Advanced Medical Infrastructure</h1>
          <p>Harnessing world-class technology to deliver precision-driven healthcare across India.</p>
          <a href="/brochure.pdf" download className="btn download-btn">
            <span>📥</span> Download Infrastructure Brochure
          </a>
        </div>
      </section>

      <section className="infra-details-modern section">
        <div className="container">
          <div className="infra-card reveal">
            <div className="infra-img-frame">
              <img src="/images/surgical.jpg" alt="Modern Surgical Suite" />
            </div>
            <div className="infra-info">
              <span className="badge">Innovation</span>
              <h3>Modern Surgical Suites</h3>
              <p>Our operation theaters utilize laminar airflow systems and robotic-assisted surgical tools to ensure maximum precision and safety.</p>
              <ul className="infra-list">
                <li>Robotic Surgical Systems for minimally invasive care</li>
                <li>Laminar Airflow Technology for infection control</li>
                <li>Managed by experts with 15+ years of experience</li>
              </ul>
            </div>
          </div>

          <div className="infra-card reverse reveal">
            <div className="infra-img-frame">
              <img src="/images/diagnostics.jpg" alt="High Resolution Imaging" />
            </div>
            <div className="infra-info">
              <span className="badge">Precision</span>
              <h3>High-Resolution Diagnostics</h3>
              <p>Equipped with the latest 3T MRI and 128-Slice CT Scans for accurate diagnosis across our 8-city network.</p>
              <ul className="infra-list">
                <li>3T High-Resolution MRI Imaging</li>
                <li>128-Slice Rapid CT Scanner</li>
                <li>Available 24/7 for emergency response</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InfrastructurePage;
