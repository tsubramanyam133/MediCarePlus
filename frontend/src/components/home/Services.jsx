import React from 'react';

const Services = () => {
  return (
    <section id="services" className="section" style={{ padding: 0 }}>
      <div className="excellence-main-wrapper">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="excellence-header">
            <h2>Why Choose MediCare+</h2>
            <p>Providing world-class healthcare across 8 major cities with a focus on innovation and integrity.</p>
          </div>
          <div className="features-row">
            <div className="feature-item">
              <span className="feature-icon">🚑</span>
              <div>
                <h4>24/7 Emergency</h4>
                <p>Round-the-clock ICU and emergency services managed by expert intensivists.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👨‍⚕️</span>
              <div>
                <h4>Expert Team</h4>
                <p>Senior specialists with over 15 years of experience prioritizing your recovery.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔬</span>
              <div>
                <h4>Modern Tech</h4>
                <p>Equipped with high-resolution imaging and modern surgical suites for precision.</p>
              </div>
            </div>
          </div>
          <hr className="excellence-divider" />
          <div className="excellence-header">
            <h3>Our Specialized Services</h3>
          </div>
          <div className="service-grid-unified">
            <div className="service-card-mini">
              <img src="https://res.cloudinary.com/djkz6gshk/image/upload/v1782662783/emergency_t1izns.jpg" alt="Emergency" loading="lazy" />
              <h4>Emergency Care</h4>
            </div>
            <div className="service-card-mini">
              <img src="https://res.cloudinary.com/djkz6gshk/image/upload/v1782663022/icu_vo9v9a.jpg" alt="ICU" loading="lazy" />
              <h4>Critical Care (ICU)</h4>
            </div>
            <div className="service-card-mini">
              <img src="https://res.cloudinary.com/djkz6gshk/image/upload/v1782663072/diagnostics_fjhsjr.jpg" alt="Diagnostics" loading="lazy" />
              <h4>Advanced Diagnostics</h4>
            </div>
            <div className="service-card-mini">
              <img src="https://res.cloudinary.com/djkz6gshk/image/upload/v1782663351/pharmacy_wffn08.jpg" alt="Pharmacy" loading="lazy" />
              <h4>24/7 Pharmacy</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
