const Doctor = require('../models/Doctor');

exports.getDoctors = async (req, res) => {
  try {
    const filters = {};
    if (req.query.hospital) filters.hospital = req.query.hospital;
    if (req.query.search) filters.name = { $regex: req.query.search, $options: 'i' };
    
    const doctors = await Doctor.find(filters);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctorByName = async (req, res) => {
  try {
    const doctorName = decodeURIComponent(req.params.name);
    const doctor = await Doctor.findOne({ name: { $regex: new RegExp('^' + doctorName + '$', 'i') } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addDoctor = async (req, res) => {
  try {
    const { name, dept, hospital, experience, slots, img, bio } = req.body;
    
    if (!name || !dept || !hospital) {
      return res.status(400).json({ message: 'Name, Department, and Hospital are required' });
    }

    const newDoctor = new Doctor({
      name,
      dept,
      hospital,
      experience: experience || '',
      slots: slots || [],
      img: img || '',
      bio: bio || ''
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ message: 'Server error while adding doctor' });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dept, hospital, experience, slots, img, bio } = req.body;
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { name, dept, hospital, experience, slots, img, bio },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Server error while updating doctor' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoctor = await Doctor.findByIdAndDelete(id);

    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Server error while deleting doctor' });
  }
};
