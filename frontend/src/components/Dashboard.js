import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from './layout/Spinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    records: 0
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes, recordsRes, upcomingRes] = await Promise.all([
          axios.get('/api/patients/'),
          axios.get('/api/doctors/'),
          axios.get('/api/appointments/'),
          axios.get('/api/records/'),
          axios.get('/api/appointments/?upcoming=true')
        ]);
        
        setStats({
          patients: patientsRes.data.length,
          doctors: doctorsRes.data.length,
          appointments: appointmentsRes.data.length,
          records: recordsRes.data.length
        });
        
        setUpcomingAppointments(upcomingRes.data.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  
  return (
    <div className="dashboard">
      <h2 className="my-4">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Patients</h5>
              <h2 className="display-4">{stats.patients}</h2>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between">
              <Link to="/patients" className="text-white text-decoration-none">
                View Details
              </Link>
              <i className="bi bi-people fs-5"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Doctors</h5>
              <h2 className="display-4">{stats.doctors}</h2>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between">
              <Link to="/doctors" className="text-white text-decoration-none">
                View Details
              </Link>
              <i className="bi bi-person-badge fs-5"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Appointments</h5>
              <h2 className="display-4">{stats.appointments}</h2>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between">
              <Link to="/appointments" className="text-white text-decoration-none">
                View Details
              </Link>
              <i className="bi bi-calendar-check fs-5"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Medical Records</h5>
              <h2 className="display-4">{stats.records}</h2>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between">
              <Link to="/records" className="text-white text-decoration-none">
                View Details
              </Link>
              <i className="bi bi-file-medical fs-5"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Appointments */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Appointments</h5>
              <Link to="/appointments" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body">
              {upcomingAppointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingAppointments.map(appointment => (
                        <tr key={appointment.id}>
                          <td>
                            {appointment.patient_details.first_name} {appointment.patient_details.last_name}
                          </td>
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
                          <td>
                            <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-info me-2">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-3">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-around flex-wrap">
                <Link to="/patients/add" className="btn btn-primary m-2">
                  <i className="bi bi-person-plus me-2"></i>
                  Add Patient
                </Link>
                <Link to="/doctors/add" className="btn btn-success m-2">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Add Doctor
                </Link>
                <Link to="/appointments/add" className="btn btn-warning m-2">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule Appointment
                </Link>
                <Link to="/records/add" className="btn btn-info m-2">
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Add Medical Record
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;