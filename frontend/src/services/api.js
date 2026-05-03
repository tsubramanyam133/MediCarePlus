import {
  fetchDoctors,
  fetchDoctorByName,
  saveReport,
  fetchReportsByPhone,
  saveAppointment,
  findOrCreateUser
} from './firebaseService';

// ─── MOCK DOCTORS (used as fallback if Firestore is empty) ───────────────────
const mockDoctors = [
    { name: "Dr.Deepak Rao", dept: "Cardiology", hospital: "Kadapa", experience: "15+ Years", slots: ["Morning-9:00AM", "Evening-5:00PM"], img: "images/deepak.jpg", bio: "As a senior Cardiology specialist with 15+ years of experience, Dr. Deepak Rao leads the cardiac care team in Kadapa with a focus on preventative heart health and advanced interventional procedures." },
    { name: "Dr.Jenelia", dept: "Cardiology", hospital: "Hyderabad", experience: "15+ Years", slots: ["Morning-9:00AM", "Evening-5:00PM"], img: "images/Shyamala.jpg", bio: "Dr. Jenelia is a compassionate Cardiology specialist with 15 years of experience serving the Hyderabad region. She specializes in non-invasive diagnostics and preventive heart care." },
    { name: "Dr. Meera Kulkarni", dept: "Cardiology", hospital: "Tirupati", experience: "12+ Years", slots: ["Morning-10:00AM", "Evening-6:00PM"], img: "images/meera.jpg", bio: "With over 12 years of expertise, Dr. Meera Kulkarni is a dedicated Cardiologist in Tirupati focusing on women's heart health and pediatric cardiac care." },
    { name: "Dr.Rahul Gupta", dept: "Pulmonology", hospital: "Tirupati", experience: "17+ Years", slots: ["Morning-11:00AM", "Evening-5:00PM"], img: "images/rahul.jpg", bio: "Dr. Rahul Gupta is a seasoned Pulmonology specialist in Tirupati with 17 years of extensive experience in respiratory medicine." },
    { name: "Dr.Geetha Reddy", dept: "Dermatology", hospital: "Tirupati", experience: "15+ Years", slots: ["Morning-9:00AM", "Evening-4:00PM"], img: "images/lady2.jpg", bio: "Dr. Geetha Reddy brings 15 years of specialized experience in clinical and cosmetic Dermatology to the Tirupati community." },
    { name: "Dr. Meera Singh", dept: "Neurology", hospital: "Ananthapur", experience: "14+ Years", slots: ["Morning-11:00AM", "Evening-7:00PM"], img: "images/lady1.jpg", bio: "As a senior Neurology specialist with 14 years of experience, Dr. Meera Singh leads the neurological care team in Ananthapur." },
    { name: "Dr.Hemanth Kumar", dept: "Cardiology", hospital: "Ananthapur", experience: "14+ Years", slots: ["Morning-11:00AM", "Evening-7:00PM"], img: "images/one.jpg", bio: "Dr. Hemanth Kumar is a senior Cardiology specialist with 14 years of practice in Ananthapur." },
    { name: "Dr. Latha Kumari", dept: "Gynecology", hospital: "Kadapa", experience: "19+ Years", slots: ["Morning-11:00AM", "Evening-5:00PM"], img: "images/lathakumari.jpg", bio: "With a distinguished career spanning 19 years, Dr. Latha Kumari is a cornerstone of Women's Health in Kadapa." },
    { name: "Dr.Vallabha Das", dept: "Orthopedics", hospital: "Ananthapur", experience: "14+ Years", slots: ["Morning-11:00AM", "Evening-7:00PM"], img: "images/hemanth.jpg", bio: "Dr. Vallabha Das is a skilled Orthopedics specialist with 14 years of experience in joint replacement and sports medicine." },
    { name: "Dr.Sandhya Rani", dept: "Orthopedics", hospital: "Kurnool", experience: "10+ Years", slots: ["Morning-8:00AM", "Evening-4:00PM"], img: "images/sandhya.jpg", bio: "Dr. Sandhya Rani is an expert in Orthopedic surgery with 10 years of experience serving the Kurnool region." },
    { name: "Dr. Karthik Sharma", dept: "Cardiology", hospital: "Kurnool", experience: "10+ Years", slots: ["Morning-8:00AM", "Evening-4:00PM"], img: "images/karthik.jpg", bio: "Specializing in clinical cardiology, Dr. Karthik Sharma has spent a decade treating various heart ailments in Kurnool." },
    { name: "Dr. Suresh Babu", dept: "Neurology", hospital: "Kadapa", experience: "15+ Years", slots: ["Morning-10:00AM", "Evening-4:00PM"], img: "images/suresh.jpg", bio: "With 15 years of neurological expertise, Dr. Suresh Babu focuses on neurodegenerative and movement disorders in Kadapa." },
    { name: "Dr.Anitha Devi", dept: "Neurology", hospital: "Hyderabad", experience: "15+ Years", slots: ["Morning-10:00AM", "Evening-4:00PM"], img: "images/Anitha.jpg", bio: "Dr. Anitha Devi brings 15 years of specialized experience to the Neurology department in Hyderabad." },
    { name: "Dr. Rajesh Kumar", dept: "Gynecology", hospital: "Hyderabad", experience: "15+ Years", slots: ["Morning-10:00AM", "Evening-4:00PM"], img: "images/raj.jpg", bio: "With 15 years in women's health, Dr. Rajesh Kumar specializes in high-risk obstetrics and minimally invasive gynecological surgeries in Hyderabad." },
    { name: "Dr.Venkatesh Naik", dept: "Neurology", hospital: "Bangalore", experience: "13+ Years", slots: ["Morning-10:00AM", "Evening-4:00PM"], img: "images/Venkatesh Naik.jpg", bio: "With over 13 years of clinical excellence, Dr. Venkatesh Naik is a leading Neurologist in Bangalore." },
    { name: "Dr.Kavitha Reddy", dept: "Cardiology", hospital: "Bangalore", experience: "17+ Years", slots: ["Morning-11:00AM", "Evening-5:00PM"], img: "images/KavithaReddy.jpg", bio: "Dr. Kavitha Reddy is a senior Cardiology specialist in Bangalore with 17 years of experience." },
    { name: "Dr.Jayashree S", dept: "Orthopedics", hospital: "Bangalore", experience: "16+ Years", slots: ["Morning-11:30AM", "Evening-4:30PM"], img: "images/Jayashree.jpg", bio: "As a senior Orthopedic surgeon in Bangalore with 16 years of experience, Dr. Jayashree S specializes in spinal care and advanced arthroscopic procedures." },
    { name: "Dr. Pavan Reddy", dept: "Neurology", hospital: "Kurnool", experience: "10+ Years", slots: ["Morning-9:00AM", "Evening-4:00PM"], img: "images/pavanreddy.jpg", bio: "Dr. Pavan Reddy is a dynamic Neurology specialist in Kurnool with a decade of experience." },
    { name: "Dr.Shyla Rani", dept: "Cardiology", hospital: "Pune", experience: "17+ Years", slots: ["Morning-11:00AM", "Evening-5:00PM"], img: "images/shylarani.jpg", bio: "With 17 years of experience, Dr. Shyla Rani is a leader in cardiac wellness in Pune." },
    { name: "Dr.Vikram Singh", dept: "Orthopedics", hospital: "Pune", experience: "14+ Years", slots: ["Morning-11:30AM", "Evening-4:30PM"], img: "images/singh.jpg", bio: "Dr. Vikram Singh leads the Orthopedic team in Pune with 14 years of expertise." },
    { name: "Dr.Subha Lakshmi", dept: "Cardiology", hospital: "Ahmedabad", experience: "17+ Years", slots: ["Morning-11:00AM", "Evening-5:00PM"], img: "images/subha.jpg", bio: "A veteran Cardiologist in Ahmedabad with 17 years of experience, Dr. Subha Lakshmi is respected for her diagnostic accuracy." },
    { name: "Dr.Jagadish Patel", dept: "Neurology", hospital: "Ahmedabad", experience: "16+ Years", slots: ["Morning-10:00AM", "Evening-4:00PM"], img: "images/jagadesh.jpg", bio: "Dr. Jagadish Patel has 16 years of clinical Neurology experience in Ahmedabad." }
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const verifyOtp = async (name, phone, role) => {
  try {
    return await findOrCreateUser(phone, name, role);
  } catch (err) {
    console.warn('Realtime DB not available, using local user object:', err.message);
    // Fallback: return a local user object so login still works
    return { _id: phone, name: name || 'User', phone, role: role || 'user' };
  }
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const createReport = async (formData) => {
  return await saveReport({
    patientPhone: formData.get('patientPhone'),
    patientName: formData.get('patientName'),
    nurseId: formData.get('nurseId'),
    reportDescription: formData.get('reportDescription'),
    healthScore: formData.get('healthScore'),
    file: formData.get('file')
  });
};

export const getReports = async (phone) => {
  return await fetchReportsByPhone(phone);
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
export const getDoctors = async (hospital = '', search = '') => {
  const firestoreDoctors = await fetchDoctors(hospital, search);

  // If Firestore has no doctors yet, fall back to mock data
  if (firestoreDoctors.length === 0) {
    console.warn('No doctors in Firestore, using mock data.');
    return mockDoctors.filter(d => {
      const matchHospital = hospital ? d.hospital === hospital : true;
      const matchSearch = search ? d.name.toLowerCase().includes(search.toLowerCase()) : true;
      return matchHospital && matchSearch;
    });
  }
  return firestoreDoctors;
};

export const getDoctorByName = async (name) => {
  const doctor = await fetchDoctorByName(name);
  if (doctor) return doctor;
  // Fallback to mock data
  return mockDoctors.find(d => d.name === name) || mockDoctors[0];
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const createAppointment = async (appointmentData) => {
  return await saveAppointment(appointmentData);
};
