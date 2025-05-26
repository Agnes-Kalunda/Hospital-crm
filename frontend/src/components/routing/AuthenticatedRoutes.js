import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import Spinner from '../layout/Spinner';

// Components
import Dashboard from '../Dashboard';

// Patient Components
import PatientList from '../patients/PatientList';
import PatientDetail from '../patients/PatientDetail';
import PatientForm from '../patients/PatientForm';

// Doctor Components
import DoctorList from '../doctors/DoctorList';
import DoctorDetail from '../doctors/DoctorDetail';
import DoctorForm from '../doctors/DoctorForm';
import DoctorAvailability from '../doctors/DoctorAvailability';

// Appointment Components
import AppointmentList from '../appointments/AppointmentList';
import AppointmentDetail from '../appointments/AppointmentDetail';
import AppointmentForm from '../appointments/AppointmentForm';

// Medical Record Components
import MedicalRecordList from '../records/MedicalRecordList';
import MedicalRecordDetail from '../records/MedicalRecordDetail';
import MedicalRecordForm from '../records/MedicalRecordForm';

const AuthenticatedRoutes = () => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
        <Sidebar />
      </div>
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Patient Routes */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/add" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            
            {/* Doctor Routes */}
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/doctors/add" element={<DoctorForm />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/doctors/:id/edit" element={<DoctorForm />} />
            <Route path="/doctors/:id/availability" element={<DoctorAvailability />} />
            
            {/* Appointment Routes */}
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/add" element={<AppointmentForm />} />
            <Route path="/appointments/:id" element={<AppointmentDetail />} />
            <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
            
            {/* Medical Record Routes */}
            <Route path="/records" element={<MedicalRecordList />} />
            <Route path="/records/add" element={<MedicalRecordForm />} />
            <Route path="/records/:id" element={<MedicalRecordDetail />} />
            
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default AuthenticatedRoutes;