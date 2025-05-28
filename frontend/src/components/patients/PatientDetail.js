import React, { useState, useEffect , useContext} from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientRes, appointmentsRes, recordsRes] = await Promise.all([
          axios.get(`/api/patients/${id}/`),
          axios.get(`/api/appointments/?patient=${id}`),
          axios.get(`/api/records/?patient=${id}`)
        ]);
        
        setPatient(patientRes.data);
        setAppointments(appointmentsRes.data);
        setRecords(recordsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data');
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/patients/${id}/`);
        toast.success('Patient deleted successfully');
        navigate('/patients');
      } catch (err) {
        console.error('Error deleting patient:', err);
        toast.error('Failed to delete patient');
      }
    }
  };
  
  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!patient) return <div className="alert alert-warning">Patient not found</div>;
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{patient.first_name} {patient.last_name}</h2>
        <div>
          
            <button 
        className="btn btn-success me-2"
        onClick={() => setActiveTab('appointments')}
      >
        <i className="bi bi-calendar-plus me-1"></i> View Appointments
      </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          
        </div>
        <div className="card-body">
          {activeTab === 'details' && (
            <div className="row">
              <div className="col-md-6">
                <h5>Personal Information</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: '30%' }}>Full Name</th>
                      <td>{patient.first_name} {patient.last_name}</td>
                    </tr>
                    <tr>
                      <th>Date of Birth</th>
                      <td>{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{patient.email}</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{patient.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Address</th>
                      <td>{patient.address || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h5>Insurance Information</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: '30%' }}>Provider</th>
                      <td>{patient.insurance_provider || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Insurance ID</th>
                      <td>{patient.insurance_id || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                
                <h5 className="mt-4">Medical History</h5>
                <div className="p-3 bg-light rounded">
                  {patient.medical_history ? (
                    <p className="mb-0">{patient.medical_history}</p>
                  ) : (
                    <p className="text-muted mb-0">No medical history recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <div>
            
              
              {appointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => (
                        <tr key={appointment.id}>
                          <td>
                            Dr. {appointment.doctor_details.first_name} {appointment.doctor_details.last_name}
                          </td>
                          <td>
                            {new Date(appointment.appointment_datetime).toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge bg-${
                              appointment.status === 'SCHEDULED' ? 'success' :
                              appointment.status === 'COMPLETED' ? 'info' : 'danger'
                            }`}>
                              {appointment.status_display}
                            </span>
                          </td>
                        
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-3">No appointments found</p>
              )}
            </div>
          )}
          
          {activeTab === 'records' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
    <h5 className="mb-0">Medical Records</h5>
    <Link to={`/records/add?patient=${id}`} className="btn btn-sm btn-primary">
      Add Record
    </Link>
  </div>
              
              {records.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                      
                     <th>Date</th>
                    <th>Doctor</th>
                     <th>Diagnosis</th>
                      <th>Symptoms</th>
                      <th>Prescription</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.created_at).toLocaleDateString()}</td>
                <td>
                  {record.doctor_details ? 
                    `Dr. ${record.doctor_details.first_name} ${record.doctor_details.last_name}` : 
                    'N/A'}
                </td>
                <td>{record.diagnosis || 'N/A'}</td>
                <td>{record.symptoms || 'N/A'}</td>
                <td>{record.prescription || 'N/A'}</td>
                <td>
                  <Link to={`/records/${record.id}`} className="btn btn-sm btn-info me-2">
                    View
                  </Link>
                  
                    <Link to={`/records/${record.id}/edit`} className="btn btn-sm btn-warning">
                      Edit
                    </Link>
                  
                </td>
              </tr>
            ))}
          </tbody>
                  </table>
                </div>
              ) : (
                  <div className="text-center py-3">
                <p className="text-muted">No medical records found for this patient.</p>
                {userRole !== 'DOCTOR' && (
                  <Link to={`/records/add?patient=${id}`} className="btn btn-primary">
                    Create First Medical Record
                  </Link>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;