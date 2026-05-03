const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicareplus';

const doctors = [
    { 
        name: "Dr.Deepak Rao", 
        dept: "Cardiology", 
        hospital: "Kadapa", 
        experience: "15+ Years", 
        slots: ["Morning-9:00AM", "Evening-5:00PM"], 
        img: "images/deepak.jpg",
        bio: "As a senior Cardiology specialist with 15+ years of experience, Dr. Deepak Rao leads the cardiac care team in Kadapa with a focus on preventative heart health and advanced interventional procedures. He is committed to delivering world-class cardiovascular treatments, ensuring that the local community has access to top-tier heart care without needing to travel to major metros. His dedication to medical excellence has made him a trusted name in life-saving cardiac medicine." 
    },
    { 
        name: "Dr.Jenelia", 
        dept: "Cardiology", 
        hospital: "Hyderabad", 
        experience: "15+ Years", 
        slots: ["Morning-9:00AM", "Evening-5:00PM"], 
        img: "images/Shyamala.jpg",
        bio: "Dr. Jenelia is a compassionate Cardiology specialist with 15 years of experience serving the Hyderabad region. She specializes in non-invasive diagnostics and preventive heart care, dedicated to helping her patients manage long-term cardiovascular health through personalized lifestyle and medical interventions." 
    },
    { 
        name: "Dr. Meera Kulkarni", 
        dept: "Cardiology", 
        hospital: "Tirupati", 
        experience: "12+ Years", 
        slots: ["Morning-10:00AM", "Evening-6:00PM"], 
        img: "images/meera.jpg",
        bio: "With over 12 years of expertise, Dr. Meera Kulkarni is a dedicated Cardiologist in Tirupati focusing on women’s heart health and pediatric cardiac care. Her patient-centric approach ensures that families receive clear guidance and advanced medical care for both common and complex cardiac conditions." 
    },
    { 
        name: "Dr.Rahul Gupta", 
        dept: "Pulmonology", 
        hospital: "Tirupati", 
        experience: "17+ Years", 
        slots: ["Morning-11:00AM", "Evening-5:00PM"], 
        img: "images/rahul.jpg",
        bio: "Dr. Rahul Gupta is a seasoned Pulmonology specialist in Tirupati with 17 years of extensive experience in respiratory medicine. He specializes in the treatment of chronic lung diseases, asthma, and sleep disorders, utilizing modern diagnostic tools to provide comprehensive care for his patients." 
    },
    { 
        name: "Dr.Geetha Reddy", 
        dept: "Dermatology", 
        hospital: "Tirupati", 
        experience: "15+ Years", 
        slots: ["Morning-9:00AM", "Evening-4:00PM"], 
        img: "images/lady2.jpg",
        bio: "Dr. Geetha Reddy brings 15 years of specialized experience in clinical and cosmetic Dermatology to the Tirupati community. She provides expert care for chronic skin conditions and advanced aesthetic treatments, ensuring her patients receive the highest standard of dermatological health and wellness." 
    },
    { 
        name: "Dr. Meera Singh", 
        dept: "Neurology", 
        hospital: "Ananthapur", 
        experience: "14+ Years", 
        slots: ["Morning-11:00AM", "Evening-7:00PM"], 
        img: "images/lady1.jpg",
        bio: "As a senior Neurology specialist with 14 years of experience, Dr. Meera Singh leads the neurological care team in Ananthapur. She specializes in stroke management and epilepsy, combining advanced diagnostic technology with a patient-first approach to manage complex nervous system disorders." 
    },
    { 
        name: "Dr.Hemanth Kumar", 
        dept: "Cardiology", 
        hospital: "Ananthapur", 
        experience: "14+ Years", 
        slots: ["Morning-11:00AM", "Evening-7:00PM"], 
        img: "images/one.jpg",
        bio: "Dr. Hemanth Kumar is a senior Cardiology specialist with 14 years of practice in Ananthapur. Known for his expertise in managing acute cardiac emergencies, he is instrumental in providing high-standard heart care and life-saving interventions to the local community." 
    },
    { 
        name: "Dr. Latha Kumari", 
        dept: "Gynecology", 
        hospital: "Kadapa", 
        experience: "19+ Years", 
        slots: ["Morning-11:00AM", "Evening-5:00PM"], 
        img: "images/lathakumari.jpg",
        bio: "With a distinguished career spanning 19 years, Dr. Latha Kumari is a cornerstone of Women’s Health in Kadapa. Specializing in high-risk obstetrics and maternal health, she provides a supportive environment and expert clinical care for women at every stage of life." 
    },
    { 
        name: "Dr.Vallabha Das", 
        dept: "Orthopedics", 
        hospital: "Ananthapur", 
        experience: "14+ Years", 
        slots: ["Morning-11:00AM", "Evening-7:00PM"], 
        img: "images/hemanth.jpg",
        bio: "Dr. Vallabha Das is a skilled Orthopedics specialist with 14 years of experience in joint replacement and sports medicine. Based in Ananthapur, he is committed to restoring mobility and improving the quality of life for his patients through advanced surgical and rehabilitative techniques." 
    },
    { 
        name: "Dr.Sandhya Rani", 
        dept: "Orthopedics", 
        hospital: "Kurnool", 
        experience: "10+ Years", 
        slots: ["Morning-8:00AM", "Evening-4:00PM"], 
        img: "images/sandhya.jpg",
        bio: "Dr. Sandhya Rani is an expert in Orthopedic surgery with 10 years of experience serving the Kurnool region. She focuses on fracture management and pediatric orthopedics, providing compassionate care and effective treatment plans for patients of all ages." 
    },
    { 
        name: "Dr. Karthik Sharma", 
        dept: "Cardiology", 
        hospital: "Kurnool", 
        experience: "10+ Years", 
        slots: ["Morning-8:00AM", "Evening-4:00PM"], 
        img: "images/karthik.jpg",
        bio: "Specializing in clinical cardiology, Dr. Karthik Sharma has spent a decade treating various heart ailments in Kurnool. He is committed to using evidence-based medicine to provide efficient heart care, ensuring his patients achieve optimal cardiovascular health." 
    },
    { 
        name: "Dr. Suresh Babu", 
        dept: "Neurology", 
        hospital: "Kadapa", 
        experience: "15+ Years", 
        slots: ["Morning-10:00AM", "Evening-4:00PM"], 
        img: "images/suresh.jpg",
        bio: "With 15 years of neurological expertise, Dr. Suresh Babu focuses on neurodegenerative and movement disorders in Kadapa. He is dedicated to providing advanced neurological solutions and personalized care plans to improve the daily lives of his patients." 
    },
    { 
        name: "Dr.Anitha Devi", 
        dept: "Neurology", 
        hospital: "Hyderabad", 
        experience: "15+ Years", 
        slots: ["Morning-10:00AM", "Evening-4:00PM"], 
        img: "images/Anitha.jpg",
        bio: "Dr. Anitha Devi brings 15 years of specialized experience to the Neurology department in Hyderabad. Highly regarded for her expertise in neurological diagnostics and long-term patient care, she ensures every patient receives a treatment plan backed by the latest research." 
    },
    { 
        name: "Dr. Rajesh Kumar", 
        dept: "Gynecology", 
        hospital: "Hyderabad", 
        experience: "15+ Years", 
        slots: ["Morning-10:00AM", "Evening-4:00PM"], 
        img: "images/raj.jpg",
        bio: "With 15 years in women’s health, Dr. Rajesh Kumar specializes in high-risk obstetrics and minimally invasive gynecological surgeries in Hyderabad. He is dedicated to providing comprehensive and compassionate care tailored to the unique needs of his patients." 
    },
    { 
        name: "Dr.Venkatesh Naik", 
        dept: "Neurology", 
        hospital: "Bangalore", 
        experience: "13+ Years", 
        slots: ["Morning-10:00AM", "Evening-4:00PM"], 
        img: "images/Venkatesh Naik.jpg",
        bio: "With over 13 years of clinical excellence, Dr. Venkatesh Naik is a leading Neurologist in Bangalore. He manages conditions ranging from chronic migraines to neuro-rehabilitative care, combining advanced technology with a patient-first approach to neurological health." 
    },
    { 
        name: "Dr.Kavitha Reddy", 
        dept: "Cardiology", 
        hospital: "Bangalore", 
        experience: "17+ Years", 
        slots: ["Morning-11:00AM", "Evening-5:00PM"], 
        img: "images/KavithaReddy.jpg",
        bio: "Dr. Kavitha Reddy is a senior Cardiology specialist in Bangalore with 17 years of experience. She focuses on advanced cardiac diagnostics and the management of chronic cardiovascular diseases, utilizing state-of-the-art technology to ensure peak heart health." 
    },
    { 
        name: "Dr.Jayashree S", 
        dept: "Orthopedics", 
        hospital: "Bangalore", 
        experience: "16+ Years", 
        slots: ["Morning-11:30AM", "Evening-4:30PM"], 
        img: "images/Jayashree.jpg",
        bio: "As a senior Orthopedic surgeon in Bangalore with 16 years of experience, Dr. Jayashree S specializes in spinal care and advanced arthroscopic procedures. She is dedicated to providing high-quality surgical solutions to restore mobility and comfort for her patients." 
    },
    { 
        name: "Dr. Pavan Reddy", 
        dept: "Neurology", 
        hospital: "Kurnool", 
        experience: "10+ Years", 
        slots: ["Morning-9:00AM", "Evening-4:00PM"], 
        img: "images/pavanreddy.jpg",
        bio: "Dr. Pavan Reddy is a dynamic Neurology specialist in Kurnool with a decade of experience. He is recognized for his expertise in treating neurological trauma and creating personalized neuro-rehabilitation plans to support his patients' recovery." 
    },
    { 
        name: "Dr.Shyla Rani", 
        dept: "Cardiology", 
        hospital: "Pune", 
        experience: "17+ Years", 
        slots: ["Morning-11:00AM", "Evening-5:00PM"], 
        img: "images/shylarani.jpg",
        bio: "With 17 years of experience, Dr. Shyla Rani is a leader in cardiac wellness in Pune. She specializes in hypertension management and heart failure prevention, dedicated to helping her patients lead healthy, heart-conscious lives." 
    },
    { 
        name: "Dr.Vikram Singh", 
        dept: "Orthopedics", 
        hospital: "Pune", 
        experience: "14+ Years", 
        slots: ["Morning-11:30AM", "Evening-4:30PM"], 
        img: "images/singh.jpg",
        bio: "Dr. Vikram Singh leads the Orthopedic team in Pune with 14 years of expertise. He is highly skilled in trauma surgery and corrective procedures, committed to delivering precise orthopedic care to improve the physical well-being of his patients." 
    },
    { 
        name: "Dr.Subha Lakshmi", 
        dept: "Cardiology", 
        hospital: "Ahmedabad", 
        experience: "17+ Years", 
        slots: ["Morning-11:00AM", "Evening-5:00PM"], 
        img: "images/subha.jpg",
        bio: "A veteran Cardiologist in Ahmedabad with 17 years of experience, Dr. Subha Lakshmi is respected for her diagnostic accuracy. She is dedicated to patient education and the management of cardiovascular health through consistent, evidence-based care." 
    },
    { 
        name: "Dr.Jagadish Patel", 
        dept: "Neurology", 
        hospital: "Ahmedabad", 
        experience: "16+ Years", 
        slots: ["Morning-10:00AM", "Evening-4:00PM"], 
        img: "images/jagadesh.jpg",
        bio: "Dr. Jagadish Patel has 16 years of clinical Neurology experience in Ahmedabad. He specializes in treating complex headaches and sleep disorders, ensuring that his patients receive advanced neurological care in a modern medical environment." 
    }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
