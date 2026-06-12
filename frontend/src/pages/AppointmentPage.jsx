import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoctors, createAppointment } from '../services/api';
import Navbar from '../components/Navbar';

const hospitalDepts = {
  Bangalore: ["Cardiology", "Neurology", "Orthopedics"],
  Hyderabad: ["Neurology", "Gynecology", "Cardiology"],
  Kadapa: ["Cardiology", "Neurology", "Gynecology"],
  Tirupati: ["Cardiology", "Pulmonology", "Dermatology"],
  Kurnool: ["Orthopedics", "Cardiology", "Neurology"],
  Ananthapur: ["Neurology", "Cardiology", "Orthopedics"],
  Pune: ["Orthopedics", "Cardiology"],
  Ahmedabad: ["Cardiology", "Neurology"]
};

const AppointmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState('');
  const [dept, setDept] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const [doctorsList, setDoctorsList] = useState([]);
  const [availableDepts, setAvailableDepts] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loadingPopup, setLoadingPopup] = useState(false);
  const [confirmCard, setConfirmCard] = useState(false);
  const [locked, setLocked] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDoctors();
        setDoctorsList(docs);

        // Pre-fill if coming from doctor profile
        const params = new URLSearchParams(location.search);
        const doctorFromProfile = params.get('doctor');
        
        if (doctorFromProfile && docs.length > 0) {
          const d = docs.find(x => x.name === doctorFromProfile);
          if (d) {
            setCity(d.hospital);
            setDept(d.dept);
            setDoctor(d.name);
            setAvailableSlots(d.slots);
            setLocked(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, [location.search]);

  useEffect(() => {
    if (city && !locked) {
      setAvailableDepts(hospitalDepts[city] || []);
      setDept('');
      setDoctor('');
      setSlot('');
    }
  }, [city, locked]);

  useEffect(() => {
    if (dept && city && !locked) {
      const filteredDocs = doctorsList.filter(d => d.hospital === city && d.dept === dept);
      setAvailableDoctors(filteredDocs);
      setDoctor('');
      setSlot('');
    }
  }, [dept, city, doctorsList, locked]);

  useEffect(() => {
    if (doctor && !locked) {
      const selectedDoc = doctorsList.find(d => d.name === doctor);
      setAvailableSlots(selectedDoc ? selectedDoc.slots : []);
      setSlot('');
    }
  }, [doctor, doctorsList, locked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city || !dept || !doctor || !date || !slot) {
      alert("Please fill all details");
      return;
    }

    setLoadingPopup(true);
    
    try {
      const formData = new FormData();
      formData.append('userId', user ? user._id : 'mock');
      formData.append('doctorName', doctor);
      formData.append('city', city);
      formData.append('dept', dept);
      formData.append('date', date);
      formData.append('slot', slot);
      if (file) {
        formData.append('file', file);
      }

      await createAppointment(formData);

      setTimeout(() => {
        setLoadingPopup(false);
        setConfirmCard(true);
      }, 1200);

    } catch (err) {
      setLoadingPopup(false);
      alert("Error booking appointment: " + err.message);
    }
  };

  const closeConfirm = () => {
    setConfirmCard(false);
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="appointment-page">
        <h2 className="simple-header">Book Your Appointment</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={locked} required>
            <option value="">Select City</option>
            {Object.keys(hospitalDepts).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select id="dept" value={dept} onChange={(e) => setDept(e.target.value)} disabled={locked} required>
            <option value="">Select Specialty</option>
            {locked ? <option value={dept}>{dept}</option> : availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select id="doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} disabled={locked} required>
            <option value="">Select Doctor</option>
            {locked ? <option value={doctor}>{doctor}</option> : availableDoctors.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>

          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />

          <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)} required>
            <option value="">Select Slot</option>
            {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', marginBottom: '10px' }}>
            <label style={{ fontWeight: '500', color: '#fff', alignSelf: 'flex-start', fontSize: '14px' }}>Upload Previous Reports / Prescriptions (Optional PDF)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files[0])} 
              style={{ 
                padding: '10px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                color: '#fff', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '14px',
                cursor: 'pointer'
              }} 
            />
          </div>

          <button type="submit" className="btn" style={{ width: '90%', fontSize: '18px', marginTop: '10px' }}>Confirm Appointment</button>
        </form>
      </div>

      {loadingPopup && (
        <div id="loadingPopup" className="popup">
          <div className="loading-box">
            <div className="loader-wrapper">
              <div className="circle-ring"></div>
              <img src="/images/hospital.png" alt="Hospital Cross" className="hospital-cross" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <h3 className="loading-text">Scheduling Appointment<span className="dots"></span></h3>
          </div>
        </div>
      )}

      {confirmCard && (
        <div className="popup">
          <div className="confirm-card" id="confirmCard">
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#155724' }}>Appointment Confirmed</h2>
            <div className="success-icon">✔️</div>
            <hr style={{ margin: '15px 0' }} />
            <p><strong>Name:</strong> <span>{user.name}</span></p>
            <p><strong>Phone:</strong> <span>{user.phone}</span></p>
            <p><strong>City:</strong> <span>{city}</span></p>
            <p><strong>Department:</strong> <span>{dept}</span></p>
            <p><strong>Doctor:</strong> <span>{doctor}</span></p>
            <p><strong>Date:</strong> <span>{date}</span></p>
            <p><strong>Slot:</strong> <span>{slot}</span></p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="done-btn" onClick={closeConfirm}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentPage;
