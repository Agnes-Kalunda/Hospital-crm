import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Layout 
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import PrivateRoute from './PrivateRoute';

// Auth 
import Login from '../auth/Login';
// import Register from '../auth/Register';
import Dashboard from '../Dashboard';

// Patient
import PatientList from '../patients/PatientList';
import PatientDetail from '../patients/PatientDetail';
import PatientForm from '../patients/PatientForm';

// Doctor 
import DoctorList from '../doctors/DoctorList';
import DoctorDetail from '../doctors/DoctorDetail';
import DoctorForm from '../doctors/DoctorForm';
import DoctorAvailability from '../doctors/DoctorAvailability';

// Appointment 
import AppointmentList from '../appointments/AppointmentList';
import AppointmentDetail from '../appointments/AppointmentDetail';
import AppointmentForm from '../appointments/AppointmentForm';

// Medical Record 
import MedicalRecordList from '../records/MedicalRecordList';
import MedicalRecordDetail from '../records/MedicalRecordDetail';
import MedicalRecordForm from '../records/MedicalRecordForm';

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          {token && (
            <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
              <Sidebar />
            </div>
          )}
          
          <main className={token ? "col-md-9 ms-sm-auto col-lg-10 px-md-4" : "col-12 px-4"}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              
              
              {/* Dashboard */}
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              {/* Patient Routes */}
              <Route path="/patients" element={
                <PrivateRoute>
                  <PatientList />
                </PrivateRoute>
              } />
              <Route path="/patients/add" element={
                <PrivateRoute>
                  <PatientForm />
                </PrivateRoute>
              } />
              <Route path="/patients/:id" element={
                <PrivateRoute>
                  <PatientDetail />
                </PrivateRoute>
              } />
              <Route path="/patients/:id/edit" element={
                <PrivateRoute>
                  <PatientForm />
                </PrivateRoute>
              } />
              
              {/* Doctor Routes */}
              <Route path="/doctors" element={
                <PrivateRoute>
                  <DoctorList />
                </PrivateRoute>
              } />
              <Route path="/doctors/add" element={
                <PrivateRoute>
                  <DoctorForm />
                </PrivateRoute>
              } />
              <Route path="/doctors/:id" element={
                <PrivateRoute>
                  <DoctorDetail />
                </PrivateRoute>
              } />
              <Route path="/doctors/:id/edit" element={
                <PrivateRoute>
                  <DoctorForm />
                </PrivateRoute>
              } />
              <Route path="/doctors/:id/availability" element={
                <PrivateRoute>
                  <DoctorAvailability />
                </PrivateRoute>
              } />
              
              {/* Appointment Routes */}
              <Route path="/appointments" element={
                <PrivateRoute>
                  <AppointmentList />
                </PrivateRoute>
              } />
              <Route path="/appointments/add" element={
                <PrivateRoute>
                  <AppointmentForm />
                </PrivateRoute>
              } />
              <Route path="/appointments/:id" element={
                <PrivateRoute>
                  <AppointmentDetail />
                </PrivateRoute>
              } />
              <Route path="/appointments/:id/edit" element={
                <PrivateRoute>
                  <AppointmentForm />
                </PrivateRoute>
              } />
              
              {/* Medical Record Routes */}
              <Route path="/records" element={
                <PrivateRoute>
                  <MedicalRecordList />
                </PrivateRoute>
              } />
              <Route path="/records/add" element={
                <PrivateRoute>
                  <MedicalRecordForm />
                </PrivateRoute>
              } />
              <Route path="/records/:id" element={
                <PrivateRoute>
                  <MedicalRecordDetail />
                </PrivateRoute>
              } />
              
           
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

export default AppRoutes;