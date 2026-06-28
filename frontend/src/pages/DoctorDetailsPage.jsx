import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByName } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorDetailsPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doc = await getDoctorByName(name);
        setDoctor(doc);
      } catch (err) {
        console.error("Doctor not found", err);
      }
    };
    fetchDoctor();
  }, [name]);

  if (!doctor) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="doctor-profile-page">
        <button className="back-btn" onClick={() => navigate('/#doctors')}>← Back to Doctors</button>

        <div className="doctor-profile-card">
          <div className="doctor-profile-image">
            <img src={doctor.img?.startsWith('http') ? doctor.img : '/' + doctor.img} alt={doctor.name} onError={(e) => { e.target.src = '/images/default-doctor.jpg'; }} />
          </div>

          <div className="doctor-profile-info">
            <h1>{doctor.name}</h1>
            <p className="speciality">{doctor.dept}</p>
            
            <div className="info-row">
              <span>⭐ {doctor.experience}</span>
              <span>📍 {doctor.hospital}</span>
            </div>

            <p className="bio">{doctor.bio}</p>

            <button className="btn book-btn" onClick={() => navigate(`/appointment?doctor=${encodeURIComponent(doctor.name)}`)}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDetailsPage;
