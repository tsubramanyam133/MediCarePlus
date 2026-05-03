import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createReport } from '../services/api';

const NurseDashboard = () => {
  const { user } = useAuth();
  const [patientPhone, setPatientPhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [healthScore, setHealthScore] = useState(100);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!/^[6-9]\d{9}$/.test(patientPhone.trim())) {
      setError('Please enter a valid 10-digit patient phone number.');
      return;
    }

    if (!file) {
      setError('Please attach a patient report file.');
      return;
    }

    try {
      // Build FormData so createReport in api.js can extract values
      const formData = new FormData();
      formData.append('patientPhone', patientPhone);
      formData.append('patientName', patientName);
      formData.append('nurseId', user._id || user.phone);
      formData.append('reportDescription', reportDescription);
      formData.append('healthScore', healthScore);
      formData.append('file', file);

      await createReport(formData);
      setMessage('Report uploaded successfully!');
      window.alert('Report uploaded successfully!');
      
      // Clear form
      setPatientPhone('');
      setPatientName('');
      setReportDescription('');
      setHealthScore(100);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload report: ' + err.message);
    }
  };

  if (!user || user.role !== 'nurse') {
    return (
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2>Access Denied</h2>
        <p>You must be logged in as a Nurse to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="nurse-dashboard" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ color: '#0d47a1', marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
          Nurse Dashboard
        </h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Welcome, {user.name}. Use this portal to upload patient health reports.</p>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Upload Patient Report</h3>
          
          {message && <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}
          {error && <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontWeight: '500', color: '#444' }}>Patient Name</label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  placeholder="e.g. John Doe"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontWeight: '500', color: '#444' }}>Patient Phone Number</label>
                <input 
                  type="tel" 
                  value={patientPhone} 
                  onChange={(e) => setPatientPhone(e.target.value)} 
                  placeholder="e.g. 9876543210"
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500', color: '#444' }}>Health Score (0-100)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={healthScore} 
                  onChange={(e) => setHealthScore(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 'bold', minWidth: '40px', color: healthScore < 50 ? '#d32f2f' : '#2e7d32' }}>
                  {healthScore}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500', color: '#444' }}>Report Notes & Findings</label>
              <textarea 
                value={reportDescription} 
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Detailed analysis, conditions like 'high blood pressure', 'cholesterol', etc."
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '150px', fontSize: '1rem', resize: 'vertical' }}
                required 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500', color: '#444' }}>Attach File</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])} 
                style={{ padding: '0.5rem 0', fontSize: '1rem' }}
                accept="image/*,.pdf"
                required
              />
            </div>

            <button type="submit" className="btn" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
              Upload Report
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NurseDashboard;
