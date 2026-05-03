import { db } from '../firebase';
import {
  ref,
  set,
  get,
  push,
  query,
  orderByChild,
  equalTo,
  update
} from 'firebase/database';

// ─── HELPER: Convert file to base64 string ───────────────────────────────────
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ─── USERS ───────────────────────────────────────────────────────────────────

/**
 * Find a user by phone. If not found, create one.
 * We use phone number as the key (replace dots/special chars).
 */
export const findOrCreateUser = async (phone, name, role) => {
  const safePhone = phone.replace(/[.#$[\]]/g, '_');
  const userRef = ref(db, `users/${safePhone}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const existingUser = snapshot.val();
    if (role && existingUser.role !== role) {
      await update(userRef, { role });
      return { ...existingUser, role, _id: safePhone };
    }
    return { ...existingUser, _id: safePhone };
  } else {
    const newUser = { name: name || 'User', phone, role: role || 'user' };
    await set(userRef, newUser);
    return { ...newUser, _id: safePhone };
  }
};

// ─── DOCTORS ─────────────────────────────────────────────────────────────────

export const fetchDoctors = async (hospital = '', search = '') => {
  try {
    const doctorsRef = ref(db, 'doctors');
    const snapshot = await get(doctorsRef);

    if (!snapshot.exists()) return [];

    let doctors = [];
    snapshot.forEach(child => {
      doctors.push({ id: child.key, ...child.val() });
    });

    if (hospital) {
      doctors = doctors.filter(d => d.hospital === hospital);
    }
    if (search) {
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return doctors;
  } catch (err) {
    console.error('Realtime DB doctors fetch error:', err);
    return [];
  }
};

export const fetchDoctorByName = async (name) => {
  try {
    const doctorsRef = ref(db, 'doctors');
    const snapshot = await get(doctorsRef);
    if (!snapshot.exists()) return null;

    let found = null;
    snapshot.forEach(child => {
      const d = child.val();
      if (d.name.toLowerCase() === name.toLowerCase()) {
        found = { id: child.key, ...d };
      }
    });
    return found;
  } catch (err) {
    console.error('Realtime DB doctor fetch error:', err);
    return null;
  }
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export const saveReport = async ({ patientPhone, patientName, nurseId, reportDescription, healthScore, file }) => {
  let attachedFileUrl = null;

  // Convert file to base64 to store directly in Realtime DB (no Storage needed)
  if (file) {
    try {
      attachedFileUrl = await fileToBase64(file);
    } catch (err) {
      console.warn('File conversion failed:', err);
    }
  }

  const reportsRef = ref(db, 'reports');
  const newReportRef = push(reportsRef);

  const report = {
    patientPhone,
    patientName,
    nurseId,
    reportDescription,
    healthScore: Number(healthScore),
    attachedFileUrl,
    date: new Date().toISOString()
  };

  await set(newReportRef, report);
  return { ...report, _id: newReportRef.key };
};

export const fetchReportsByPhone = async (phone) => {
  try {
    const reportsRef = ref(db, 'reports');
    const reportsQuery = query(reportsRef, orderByChild('patientPhone'), equalTo(phone));
    const snapshot = await get(reportsQuery);

    if (!snapshot.exists()) return [];

    const reports = [];
    snapshot.forEach(child => {
      reports.push({ _id: child.key, ...child.val() });
    });

    // Sort newest first
    return reports.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    console.error('Realtime DB reports fetch error:', err);
    return [];
  }
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

export const saveAppointment = async (appointmentData) => {
  const appointmentsRef = ref(db, 'appointments');
  const newRef = push(appointmentsRef);
  const appointment = { ...appointmentData, date: new Date().toISOString() };
  await set(newRef, appointment);
  return { ...appointment, _id: newRef.key };
};
