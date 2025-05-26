import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/api/patients/');
        setPatients(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Patients</h2>
        <Link to="/patients/add" className="btn btn-primary">
          <i className="bi bi-person-plus me-2"></i>
          Add Patient
        </Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text"
              className="form-control"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="card-body">
          {filteredPatients.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Insurance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.first_name} {patient.last_name}</td>
                      <td>{patient.email}</td>
                      <td>{patient.phone || 'N/A'}</td>
                      <td>{patient.insurance_provider || 'N/A'}</td>
                      <td>
                        <Link to={`/patients/${patient.id}`} className="btn btn-sm btn-info me-2">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link to={`/patients/${patient.id}/edit`} className="btn btn-sm btn-warning me-2">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <Link to={`/appointments/add?patient=${patient.id}`} className="btn btn-sm btn-success">
                          <i className="bi bi-calendar-plus"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-3">No patients found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;