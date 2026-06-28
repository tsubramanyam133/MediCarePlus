import React from 'react';

const Testimonials = () => {
  return (
    <section className="testimonials section reveal" id="testimonials">
      <div className="container">
        <h2 className="section-title">Patient Testimonials</h2>
        
        <div className="marquee-container">
          <div className="marquee-content">
            {/* Set 1 */}
            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>"The cardiac team at MediCare+ Kadapa provided exceptional care during my emergency. Dr. Deepak Rao's expertise and the staff's compassion truly made a difference in my recovery."</p>
                <h4>— R. Sharma</h4>
              </div>
              <div className="testimonial-card">
                <p>"I visited the Hyderabad facility for my heart condition. Dr. Jenelia's personalized approach and the advanced tech gave me confidence. Highly recommended!"</p>
                <h4>— S. Varma</h4>
              </div>
              <div className="testimonial-card">
                <p>"Dr. Meera Kulkarni in Tirupati was incredibly patient and thorough with my cardiac diagnosis. Best healthcare experience I've had in years."</p>
                <h4>— A. Reddy</h4>
              </div>
              <div className="testimonial-card">
                <p>"Dealing with asthma was tough until I met Dr. Rahul Gupta in Pulmonology. His treatment plan completely changed my day-to-day life."</p>
                <h4>— K. Prasad</h4>
              </div>
              <div className="testimonial-card">
                <p>"The dermatology team is fantastic. Dr. Geetha Reddy helped me clear up a severe skin condition that had bothered me for years."</p>
                <h4>— M. Singh</h4>
              </div>
            </div>

            {/* Set 2 (Duplicate for seamless scrolling loop) */}
            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>"The cardiac team at MediCare+ Kadapa provided exceptional care during my emergency. Dr. Deepak Rao's expertise and the staff's compassion truly made a difference in my recovery."</p>
                <h4>— R. Sharma</h4>
              </div>
              <div className="testimonial-card">
                <p>"I visited the Hyderabad facility for my heart condition. Dr. Jenelia's personalized approach and the advanced tech gave me confidence. Highly recommended!"</p>
                <h4>— S. Varma</h4>
              </div>
              <div className="testimonial-card">
                <p>"Dr. Meera Kulkarni in Tirupati was incredibly patient and thorough with my cardiac diagnosis. Best healthcare experience I've had in years."</p>
                <h4>— A. Reddy</h4>
              </div>
              <div className="testimonial-card">
                <p>"Dealing with asthma was tough until I met Dr. Rahul Gupta in Pulmonology. His treatment plan completely changed my day-to-day life."</p>
                <h4>— K. Prasad</h4>
              </div>
              <div className="testimonial-card">
                <p>"The dermatology team is fantastic. Dr. Geetha Reddy helped me clear up a severe skin condition that had bothered me for years."</p>
                <h4>— M. Singh</h4>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
