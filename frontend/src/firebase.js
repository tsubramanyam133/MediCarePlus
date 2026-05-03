import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoP187hMLCPdT23_i4bR-YUM8liS4kD74",
  authDomain: "medicareplus-77220.firebaseapp.com",
  projectId: "medicareplus-77220",
  storageBucket: "medicareplus-77220.firebasestorage.app",
  messagingSenderId: "998031938380",
  appId: "1:998031938380:web:38a7f77ae891c328f235e9",
  databaseURL: "https://medicareplus-77220-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
