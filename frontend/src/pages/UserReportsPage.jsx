import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getReports } from '../services/api';

const UserReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.phone) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const data = await getReports(user.phone);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeReport = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    if (lowerText.includes('blood pressure') || lowerText.includes('bp')) {
      suggestions.push("Monitor sodium intake and practice daily relaxation techniques to manage blood pressure.");
    }
    if (lowerText.includes('sugar') || lowerText.includes('diabetes') || lowerText.includes('glucose')) {
      suggestions.push("Maintain a balanced diet low in refined carbohydrates and exercise regularly to manage blood sugar.");
    }
    if (lowerText.includes('cholesterol') || lowerText.includes('lipid')) {
      suggestions.push("Focus on heart-healthy fats, avoid trans fats, and incorporate more soluble fiber into your meals.");
    }
    if (lowerText.includes('weight') || lowerText.includes('obesity')) {
      suggestions.push("Engage in at least 30 minutes of moderate aerobic activity daily and consult a nutritionist.");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Maintain a healthy lifestyle with a balanced diet, adequate hydration, and regular exercise.");
    }
    return suggestions;
  };

  if (!user || user.role !== 'user') {
    return (
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2>Access Denied</h2>
        <p>You must be logged in as a Patient to view reports.</p>
      </div>
    );
  }

  return (
    <div className="user-reports-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ color: '#0d47a1', marginBottom: '0.5rem' }}>My Health Reports</h2>
            <p style={{ color: '#666', margin: 0 }}>View your diagnostic analysis and AI-driven suggestions.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div style={{ background: 'white', padding: '3rem 2rem', textAlign: 'center', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#555' }}>No Reports Found</h3>
            <p style={{ color: '#888' }}>Your nurse has not uploaded any reports yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {reports.map((report, idx) => (
              <div key={report._id || idx} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1.5rem', background: '#0d47a1', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Report Date: {new Date(report.date).toLocaleDateString()}</h3>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>
                    Uploaded by Clinic
                  </span>
                </div>
                
                <div style={{ padding: '2rem' }}>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#0d47a1', margin: 0, fontSize: '1.2rem' }}>Patient: {report.patientName || user.name}</h4>
                    {report.attachedFileUrl && (
                      <a 
                        href={report.attachedFileUrl.startsWith('data:') ? report.attachedFileUrl : `http://localhost:5000${report.attachedFileUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        download={report.attachedFileUrl.startsWith('data:') ? 'Attached_Report_File' : undefined}
                        className="btn small"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb' }}
                      >
                        📄 {report.attachedFileUrl.startsWith('data:') ? 'Download Attached File' : 'View Attached File'}
                      </a>
                    )}
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#444' }}>Overall Health Score</span>
                      <span style={{ fontWeight: 'bold', color: report.healthScore < 50 ? '#d32f2f' : '#2e7d32' }}>{report.healthScore}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${report.healthScore}%`, 
                        background: report.healthScore < 50 ? '#d32f2f' : report.healthScore < 75 ? '#fbc02d' : '#2e7d32',
                        transition: 'width 1s ease-in-out'
                      }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#333', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Diagnosis & Notes</h4>
                    <p style={{ color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{report.reportDescription}</p>
                  </div>

                  <div style={{ background: '#f1f8e9', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #7cb342' }}>
                    <h4 style={{ color: '#33691e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>💡</span> Automated Health Suggestions
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analyzeReport(report.reportDescription).map((sugg, i) => (
                        <li key={i}>{sugg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserReportsPage;
