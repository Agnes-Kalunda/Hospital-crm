import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    insurance_provider: '',
    insurance_id: '',
    medical_history: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchPatient();
    }
  }, [id]);
  
  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/patients/${id}/`);
      const patient = res.data;
      const formattedDate = patient.date_of_birth.split('T')[0];
      
      setFormData({
        ...patient,
        date_of_birth: formattedDate
      });
    } catch (err) {
      console.error('Error fetching patient:', err);
      toast.error('Failed to load patient data');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await axios.put(`/api/patients/${id}/`, formData);
        toast.success('Patient updated successfully');
      } else {
        await axios.post('/api/patients/', formData);
        toast.success('Patient added successfully');
      }
      
      navigate('/patients');
    } catch (err) {
      console.error('Error saving patient:', err);
      
      if (err.response?.data) {
        setFormErrors(err.response.data);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to save patient');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Patient' : 'Add Patient'}
        </h2>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 mb-4">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.date_of_birth}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Insurance & Medical Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 mb-4">
                Insurance & Medical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="insurance_provider"
                    name="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.insurance_provider ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.insurance_provider && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.insurance_provider}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="insurance_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance ID
                  </label>
                  <input
                    type="text"
                    id="insurance_id"
                    name="insurance_id"
                    value={formData.insurance_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.insurance_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.insurance_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.insurance_id}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  id="medical_history"
                  name="medical_history"
                  rows="5"
                  value={formData.medical_history}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.medical_history ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.medical_history && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.medical_history}</p>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  isEdit ? 'Update Patient' : 'Save Patient'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;