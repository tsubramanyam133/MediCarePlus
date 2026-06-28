import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Modular Components
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Testimonials from '../components/home/Testimonials';
import Services from '../components/home/Services';
import DoctorsGrid from '../components/home/DoctorsGrid';
import Gallery from '../components/home/Gallery';
import Contact from '../components/home/Contact';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    if (['about', 'services', 'doctors'].includes(path)) {
      // Remove timeout and scroll immediately if element exists
      const el = document.getElementById(path);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback: If elements are lazy-loaded and not in DOM yet, try scrolling after a short frame
        requestAnimationFrame(() => {
          const lazyEl = document.getElementById(path);
          if (lazyEl) lazyEl.scrollIntoView({ behavior: 'smooth' });
        });
      }
    } else if (path === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

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
      <Helmet>
        <title>MediCare+ | World-Class Health Care & Online Appointments</title>
        <meta name="description" content="MediCare+ is a premier multi-speciality hospital network offering 24/7 emergency services, top doctors, and advanced medical diagnostics." />
      </Helmet>
      <Navbar />
      <Hero />
      <About />
      <Testimonials />
      <Services />
      <DoctorsGrid />
      <Gallery />
      <Contact />
      <Footer />
    </>
  );
};

export default HomePage;

