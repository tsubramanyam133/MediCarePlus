import React, { useState } from 'react';

const Gallery = () => {
  const [lightboxImg, setLightboxImg] = useState(null);

  return (
    <>
      <section id="gallery" className="section reveal">
        <div className="container">
          <div className="gallery-header">
            <h2>Our World-Class Facilities</h2>
            <p>Explore our state-of-the-art diagnostic and surgical infrastructure.</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item" onClick={() => setLightboxImg('/images/gallery1.jpeg')}>
              <img src="/images/gallery1.jpeg" alt="Surgical Suite" loading="lazy" />
              <div className="img-overlay"><span>Modern Surgical Suite</span></div>
            </div>
            <div className="gallery-item" onClick={() => setLightboxImg('/images/gallery2.jpeg')}>
              <img src="/images/gallery2.jpeg" alt="Diagnostic Center" loading="lazy" />
              <div className="img-overlay"><span>High-Resolution Diagnostics</span></div>
            </div>
            <div className="gallery-item" onClick={() => setLightboxImg('/images/hospital.jpg')}>
              <img src="/images/hospital.jpg" alt="Hospital Exterior" loading="lazy" />
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
    </>
  );
};

export default Gallery;
