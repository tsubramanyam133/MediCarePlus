import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDoctors } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState([]);
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, hospitalFilter]);

  const fetchDocs = async () => {
    try {
      const docs = await getDoctors(hospitalFilter, search);
      setDoctorsList(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Reveal elements on scroll logic
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
    <>
      <Navbar />
      
      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-text">
          <h1>Your Health, Our Priority</h1>
          <p>Advanced medical care with compassion and trust.</p>
          <a href="/appointment" className="btn small" onClick={(e) => { e.preventDefault(); navigate('/appointment'); }}>Book Appointment</a>
        </div>
      </section>

      {/* ABOUT */}
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

      {/* TESTIMONIALS */}
      <section className="testimonials section reveal" id="testimonials">
        <div className="container">
          <h2 className="section-title">Patient Testimonials</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"The cardiac team at MediCare+ Kadapa provided exceptional care during my emergency. Dr. Deepak Rao's expertise and the staff's compassion truly made a difference in my recovery."</p>
              <h4>— R. Sharma</h4>
            </div>
            <div className="testimonial-card">
              <p>"I visited the Bangalore facility for my spinal surgery. The advanced technology and Dr. Jayashree's personalized approach gave me my mobility back. Highly recommended!"</p>
              <h4>— S. Varma</h4>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section reveal"> 
        <div className="container excellence-main-wrapper">
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
              <img src="/images/emergency.jpg" alt="Emergency" />
              <h4>Emergency Care</h4>
            </div>
            <div className="service-card-mini">
              <img src="/images/icu.jpeg" alt="ICU" />
              <h4>Critical Care (ICU)</h4>
            </div>
            <div className="service-card-mini">
              <img src="/images/diagnostics.jpeg" alt="Diagnostics" />
              <h4>Advanced Diagnostics</h4>
            </div>
            <div className="service-card-mini">
              <img src="/images/pharmacy.jpg" alt="Pharmacy" />
              <h4>24/7 Pharmacy</h4>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="section light">
        <h2>Our Doctors</h2>
        <div className="doctor-filters">
          <select id="hospitalSelect" className="filter" value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="">Select City</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kadapa">Kadapa</option>
            <option value="Tirupati">Tirupati</option>
            <option value="Ananthapur">Ananthapur</option>
            <option value="Kurnool">Kurnool</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
          <input
            type="text"
            id="doctorSearch"
            placeholder="Search doctor by name..."
            className="filter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="doctor-grid" id="doctorGrid">
          {doctorsList.length === 0 ? (
            <div className="no-results-container">
              <h3>No Doctors Found</h3>
              <button className="btn" onClick={() => { setSearch(''); setHospitalFilter(''); }}>Clear Filters</button>
            </div>
          ) : (
            doctorsList.map(d => (
              <div key={d.name} className="doctor-card" onClick={() => navigate(`/doctor/${encodeURIComponent(d.name)}`)}>
                <div className="doctor-img-bg">
                  <img src={'/' + d.img} onError={(e) => { e.target.src = '/images/default-doctor.jpg'; }} alt={d.name} />
                  <div className="doctor-overlay">
                    <h3>{d.name}</h3>
                    <p>{d.dept}</p>
                    <span>⭐ {d.experience}</span>
                    <span>📍 {d.hospital}</span>
                    <span className="view-profile">View Profile</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section reveal">
        <div className="container">
          <div className="gallery-header">
            <h2>Our World-Class Facilities</h2>
            <p>Explore our state-of-the-art diagnostic and surgical infrastructure.</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item" onClick={() => setLightboxImg('/images/gallery1.jpeg')}>
              <img src="/images/gallery1.jpeg" alt="Surgical Suite" />
              <div className="img-overlay"><span>Modern Surgical Suite</span></div>
            </div>
            <div className="gallery-item" onClick={() => setLightboxImg('/images/gallery2.jpeg')}>
              <img src="/images/gallery2.jpeg" alt="Diagnostic Center" />
              <div className="img-overlay"><span>High-Resolution Diagnostics</span></div>
            </div>
            <div className="gallery-item" onClick={() => setLightboxImg('/images/hospital.jpg')}>
              <img src="/images/hospital.jpg" alt="Hospital Exterior" />
              <div className="img-overlay"><span>MediCare+ Network</span></div>
            </div>
          </div>
        </div>
      </section>

      {lightboxImg && (
        <div id="lightbox" className="lightbox" style={{ display: 'flex' }} onClick={() => setLightboxImg(null)}>
          <span className="close-lightbox">&times;</span>
          <img id="lightbox-img" src={lightboxImg} alt="Enlarged View" />
        </div>
      )}

      {/* CONTACT */}
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
              <p>City Center, India</p>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="contact-link">View on Maps</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email Support</h3>
              <p>For reports and general inquiries.</p>
              <a href="mailto:support@medicareplus.com" className="contact-link">support@medicareplus.com</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
