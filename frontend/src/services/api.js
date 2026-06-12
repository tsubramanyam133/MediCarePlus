const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE = `http://${hostname}:5000/api`;

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data.user;
};

export const sendRegisterOtp = async (email) => {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
  return data;
};

export const registerUser = async (username, email, phone, password, role, otp) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, phone, password, role, otp })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data.user;
};

export const getDoctors = async (hospital = '', search = '') => {
  const queryParams = new URLSearchParams();
  if (hospital) queryParams.append('hospital', hospital);
  if (search) queryParams.append('search', search);

  const res = await fetch(`${API_BASE}/doctors?${queryParams.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch doctors');
  return data;
};

export const getDoctorByName = async (name) => {
  const res = await fetch(`${API_BASE}/doctors/${encodeURIComponent(name)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch doctor profile');
  return data;
};

export const createAppointment = async (formData) => {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to book appointment');
  return data;
};

export const createReport = async (formData) => {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload report');
  return data;
};

export const getReports = async (phone) => {
  const res = await fetch(`${API_BASE}/reports/${phone}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reports');
  return data;
};

export const sendForgotPasswordOtp = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send OTP code');
  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
};
