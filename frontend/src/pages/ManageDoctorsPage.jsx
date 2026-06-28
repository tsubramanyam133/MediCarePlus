import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dept: '',
    hospital: '',
    experience: '',
    slots: '',
    bio: '',
    imgUrl: '' // For holding the existing image URL when editing
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDept === 'All') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(d => d.dept === selectedDept));
    }
  }, [selectedDept, doctors]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(response.data);
      setFilteredDoctors(response.data);
      
      const depts = [...new Set(response.data.map(d => d.dept))];
      setDepartments(depts);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/doctors/${id}`);
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
        alert('Failed to delete doctor');
      }
    }
  };

  const openAddModal = () => {
    setEditingDoctorId(null);
    setFormData({ name: '', dept: '', hospital: '', experience: '', slots: '', bio: '', imgUrl: '' });
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctorId(doctor._id);
    setFormData({
      name: doctor.name,
      dept: doctor.dept,
      hospital: doctor.hospital,
      experience: doctor.experience,
      slots: doctor.slots.join(', '),
      bio: doctor.bio || '',
      imgUrl: doctor.img || ''
    });
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      throw new Error("Cloudinary credentials are not set in the environment variables.");
    }

    data.append('upload_preset', uploadPreset);
    data.append('cloud_name', cloudName);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: data
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to upload image");
    }

    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalImgUrl = formData.imgUrl;

      if (imageFile) {
        finalImgUrl = await uploadImageToCloudinary(imageFile);
      } else if (!editingDoctorId && !finalImgUrl) {
        throw new Error("Please provide an image URL or upload a file for the new doctor.");
      }

      const slotsArray = formData.slots
        ? formData.slots.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const payload = {
        ...formData,
        slots: slotsArray,
        img: finalImgUrl
      };

      if (editingDoctorId) {
        await axios.put(`http://localhost:5000/api/doctors/${editingDoctorId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/doctors', payload);
      }

      closeModal();
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save doctor details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Manage Doctors</h1>
            <p className="mt-1 text-sm text-gray-500">Update existing doctors and assign Cloudinary images.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            >
              + Add New Doctor
            </button>
          </div>
        </div>

        {/* Filter Area */}
        <div className="mb-6 flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
          <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Doctors Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* If image is a local path (starts with 'images/'), it will be broken now. Displaying a placeholder if broken. */}
                          <img className="h-10 w-10 rounded-full object-cover border" src={doc.img.startsWith('http') ? doc.img : '/fallback-avatar.png'} alt={doc.name} 
                               onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-red-500">{!doc.img.startsWith('http') && 'Image needs update!'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doc.dept}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.hospital}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.experience}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(doc)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredDoctors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No doctors found for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                  <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 pr-8">
                    {editingDoctorId ? 'Edit Doctor' : 'Add New Doctor'}
                  </h3>
                  
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleFormChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input type="text" name="dept" value={formData.dept} onChange={handleFormChange} required
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hospital</label>
                        <input type="text" name="hospital" value={formData.hospital} onChange={handleFormChange} required
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <input type="text" name="experience" value={formData.experience} onChange={handleFormChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slots (comma separated)</label>
                      <input type="text" name="slots" value={formData.slots} onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image URL</label>
                      <input type="text" name="imgUrl" value={formData.imgUrl} onChange={handleFormChange} placeholder="Paste image URL here..." className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                      
                      <div className="mt-3 flex items-center justify-between">
                        <hr className="w-full border-gray-300" />
                        <span className="px-2 text-sm text-gray-500">OR</span>
                        <hr className="w-full border-gray-300" />
                      </div>

                      <label className="mt-3 block text-sm font-medium text-gray-700">Upload New Image (Overrides URL)</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Doctor'}
                  </button>
                  <button type="button" onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDoctorsPage;
