import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="section reveal">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p className="section-sub">We are available 24/7 to provide world-class medical support across our network.</p>
        <div className="contact-wrapper">
          <div className="contact-card emergency">
            <div className="contact-icon">🚑</div>
            <h3>24/7 Emergency</h3>
            <p>Managed by expert intensivists across 8 major cities.</p>
            <a href="tel:+919391361665" className="contact-link">+91 9391361665</a>
          </div>
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Our Location</h3>
            <p>Yerramukkapalli,Kadapa District,Andhra Pradesh,516004</p>
            <a href="https://www.google.com/maps?q=14.463068770917040,78.823364672300170" target="_blank" rel="noreferrer" className="contact-link">View on Maps</a>
          </div>
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Email Support</h3>
            <p>For reports and general inquiries.</p>
            <a href="mailto:tsubramanyam071@gmail.com" className="contact-link">support@medicareplus.com</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
