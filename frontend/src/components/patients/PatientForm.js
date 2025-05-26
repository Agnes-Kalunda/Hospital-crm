import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../layout/Spinner';

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
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient:', err);
      toast.error('Failed to load patient data');
      setLoading(false);
      navigate('/patients');
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
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    }
    
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
      
      // validation errors from the server
      if (err.response?.data) {
        setFormErrors(err.response.data);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to save patient');
      }
      
      setLoading(false);
    }
  };
  
  if (loading && isEdit) return <Spinner />;
  
  return (
    <div>
      <h2>{isEdit ? 'Edit Patient' : 'Add Patient'}</h2>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="first_name" className="form-label">First Name</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                {formErrors.first_name && <div className="invalid-feedback">{formErrors.first_name}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                {formErrors.last_name && <div className="invalid-feedback">{formErrors.last_name}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className={`form-control ${formErrors.date_of_birth ? 'is-invalid' : ''}`}
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
                {formErrors.date_of_birth && <div className="invalid-feedback">{formErrors.date_of_birth}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="insurance_provider" className="form-label">Insurance Provider</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.insurance_provider ? 'is-invalid' : ''}`}
                  id="insurance_provider"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleChange}
                />
                {formErrors.insurance_provider && <div className="invalid-feedback">{formErrors.insurance_provider}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="insurance_id" className="form-label">Insurance ID</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.insurance_id ? 'is-invalid' : ''}`}
                  id="insurance_id"
                  name="insurance_id"
                  value={formData.insurance_id}
                  onChange={handleChange}
                />
                {formErrors.insurance_id && <div className="invalid-feedback">{formErrors.insurance_id}</div>}
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="medical_history" className="form-label">Medical History</label>
              <textarea
                className={`form-control ${formErrors.medical_history ? 'is-invalid' : ''}`}
                id="medical_history"
                name="medical_history"
                rows="5"
                value={formData.medical_history}
                onChange={handleChange}
              ></textarea>
              {formErrors.medical_history && <div className="invalid-feedback">{formErrors.medical_history}</div>}
            </div>
            
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate('/patients')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Patient' : 'Add Patient'
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