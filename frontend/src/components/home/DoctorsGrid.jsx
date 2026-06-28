import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors } from '../../services/api';

const DoctorsGrid = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState([]);
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    fetchDocs(); // Fetch immediately on mount
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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

  return (
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
                <img src={d.img?.startsWith('http') ? d.img : '/' + d.img} onError={(e) => { e.target.src = '/images/default-doctor.jpg'; }} alt={d.name} loading="lazy" />
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
  );
};

export default DoctorsGrid;
