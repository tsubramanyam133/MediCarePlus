import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAppointment } from '../services/api';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Medicare+ Virtual Assistant. 👨‍⚕️ How can I help you today?\n\nYou can book appointments, check your health report status, or ask about our services and locations.",
      isInitial: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateInputVal, setDateInputVal] = useState('');
  const [activeInputRequired, setActiveInputRequired] = useState(null); // 'date' etc.
  const [activeValuePrefix, setActiveValuePrefix] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && newMsgs[0].isInitial) {
        const greetingName = user ? ` ${user.username || user.name}` : '';
        newMsgs[0] = {
          ...newMsgs[0],
          text: `Hello${greetingName}! I am your Medicare+ Virtual Assistant. 👨‍⚕️ How can I help you today?\n\nYou can book appointments, check your health report status, or ask about our services and locations.`
        };
      }
      return newMsgs;
    });
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleQuickAction = (actionType) => {
    if (actionType === 'book') {
      handleSend("Book Appointment 📅", "book appointment");
    } else if (actionType === 'health') {
      handleSend("Check Health Reports 🩺", "health status");
    } else if (actionType === 'emergency') {
      handleSend("Emergency Helpline 🚑", "emergency contact");
    } else if (actionType === 'services') {
      handleSend("Hospital Services 🔬", "hospital services");
    }
  };

  const handleSend = async (displayMsg, actualMsgPayload = null) => {
    const textToSend = actualMsgPayload || displayMsg;
    if (!textToSend.trim()) return;

    // Add user message to state
    const newMessages = [...messages, { sender: 'user', text: displayMsg }];
    setMessages(newMessages);
    setInput('');
    setDateInputVal('');
    setActiveInputRequired(null);
    setLoading(true);

    try {
      // Build history for backend context
      const chatHistory = messages
        .filter(m => !m.isInitial)
        .map(m => ({
          sender: m.sender,
          text: m.text
        }))
        // Only send last 10 messages for context
        .slice(-10);

      const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userId: user ? user._id : null,
          chatHistory
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get response");

      setLoading(false);

      if (data.action === 'book_appointment' && data.appointmentDetails) {
        // Complete the appointment booking in database via existing createAppointment
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `Booking appointment details: Doctor ${data.appointmentDetails.doctorName} in ${data.appointmentDetails.city} on ${data.appointmentDetails.date} at ${data.appointmentDetails.slot}...`
        }]);

        setLoading(true);
        const details = data.appointmentDetails;
        const formData = new FormData();
        formData.append('userId', user ? user._id : 'mock');
        formData.append('doctorName', details.doctorName);
        formData.append('city', details.city);
        formData.append('dept', details.dept);
        formData.append('date', details.date);
        formData.append('slot', details.slot);

        try {
          const bookingResult = await createAppointment(formData);
          setLoading(false);
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: data.response || "Appointment booked successfully!",
            isSuccessCard: true,
            successDetails: details
          }]);
        } catch (bookingErr) {
          setLoading(false);
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: `❌ I failed to execute the booking: ${bookingErr.message}. Please try again later or book manually.`
          }]);
        }
      } else {
        // Normal chatbot text response
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: data.response,
          options: data.options || null,
          inputRequired: data.inputRequired || null,
          valuePrefix: data.valuePrefix || ''
        }]);

        if (data.inputRequired === 'date') {
          setActiveInputRequired('date');
          setActiveValuePrefix(data.valuePrefix || '');
        }
      }

    } catch (err) {
      setLoading(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `Error connecting to assistant: ${err.message}`
      }]);
    }
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    if (!dateInputVal) return;
    const formattedPayload = `${activeValuePrefix} | date:${dateInputVal}`;
    handleSend(`Date: ${dateInputVal} 📅`, formattedPayload);
  };

  // Basic utility to convert markdown bold **text** and bullet points to HTML
  const formatText = (text) => {
    if (typeof text !== 'string') return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="chatbot-widget">
      {/* FLOATING ACTION BUTTON */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open virtual health assistant"
      >
        {isOpen ? (
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>&times;</span>
        ) : (
          <div className="fab-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#8b5cf6', borderRadius: '50%' }}>
            <span className="fab-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                <circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              </svg>
            </span>
          </div>
        )}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="chatbot-window">
          {/* HEADER */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🩺</div>
              <div>
                <h4>MediCare+ Assistant</h4>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span className="status-text">Online</span>
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          {/* MESSAGES AREA */}
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message-wrapper ${msg.sender}`}>
                <div className={`chatbot-message-bubble ${msg.sender}`}>
                  {formatText(msg.text)}

                  {/* SUCCESS RECEIPT CARD */}
                  {msg.isSuccessCard && msg.successDetails && (
                    <div className="chatbot-receipt">
                      <h5>✔️ Booking Confirmed</h5>
                      <div className="receipt-details">
                        <p><strong>Doctor:</strong> {msg.successDetails.doctorName}</p>
                        <p><strong>Hospital:</strong> {msg.successDetails.city}</p>
                        <p><strong>Specialty:</strong> {msg.successDetails.dept}</p>
                        <p><strong>Date:</strong> {msg.successDetails.date}</p>
                        <p><strong>Slot:</strong> {msg.successDetails.slot}</p>
                      </div>
                      <p className="receipt-email-note">An confirmation email has been dispatched to your mailbox.</p>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE BUTTON OPTIONS */}
                {msg.sender === 'bot' && msg.options && msg.options.length > 0 && (
                  <div className="chatbot-options-container">
                    {msg.options.map((opt, oIdx) => (
                      <button 
                        key={oIdx} 
                        className="chatbot-option-pill"
                        onClick={() => handleSend(opt.label, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="chatbot-message-wrapper bot">
                <div className="chatbot-message-bubble bot typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* DATE PICKER INPUT OVERLAY */}
          {activeInputRequired === 'date' && (
            <form onSubmit={handleDateSubmit} className="chatbot-date-form">
              <input 
                type="date" 
                value={dateInputVal} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setDateInputVal(e.target.value)} 
                required 
                className="chatbot-date-picker"
              />
              <button type="submit" className="chatbot-date-btn">Confirm Date</button>
            </form>
          )}

          {/* QUICK CHIPS CONTAINER (Only show if not currently waiting/entering date) */}
          {!activeInputRequired && (
            <div className="chatbot-quick-chips">
              <button onClick={() => handleQuickAction('book')}>📅 Book Appointment</button>
              <button onClick={() => handleQuickAction('health')}>🩺 My Health Status</button>
              <button onClick={() => handleQuickAction('emergency')}>🚑 Emergency Helpline</button>
              <button onClick={() => handleQuickAction('services')}>🔬 Specialities</button>
            </div>
          )}

          {/* INPUT FOOTER */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="chatbot-footer"
          >
            <input 
              type="text" 
              placeholder={activeInputRequired ? "Select options above..." : "Ask me anything..."} 
              value={input}
              disabled={!!activeInputRequired}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || !!activeInputRequired}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
