import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import Spinner from '../layout/Spinner';

import Dashboard from '../Dashboard';
import StaffDashboard from '../staff/StaffDashboard';
import DoctorDashboard from '../doctors/DoctorDashboard';

import PatientList from '../patients/PatientList';
import PatientDetail from '../patients/PatientDetail';
import PatientForm from '../patients/PatientForm';

import DoctorList from '../doctors/DoctorList';
import DoctorDetail from '../doctors/DoctorDetail';
import DoctorForm from '../doctors/DoctorForm';
import DoctorAvailability from '../doctors/DoctorAvailability';

import AppointmentList from '../appointments/AppointmentList';
import AppointmentDetail from '../appointments/AppointmentDetail';
import AppointmentForm from '../appointments/AppointmentForm';
import DoctorAppointments from '../doctors/DoctorAppointments';

import MedicalRecordList from '../records/MedicalRecordList';
import MedicalRecordDetail from '../records/MedicalRecordDetail';
import MedicalRecordForm from '../records/MedicalRecordForm';

const AuthenticatedRoutes = () => {
  const { token, loading, userRole } = useContext(AuthContext);
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
        <Sidebar userRole={userRole} />
      </div>
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8">
          <Routes>
            <Route path="/" element={
              userRole === 'DOCTOR' ? <DoctorDashboard /> : <StaffDashboard />
            } />
            
            {userRole === 'STAFF' && (
              <>
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/add" element={<PatientForm />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/patients/:id/edit" element={<PatientForm />} />
                
                <Route path="/doctors" element={<DoctorList />} />
                <Route path="/doctors/add" element={<DoctorForm />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/doctors/:id/edit" element={<DoctorForm />} />
                
                <Route path="/appointments" element={<AppointmentList />} />
                <Route path="/appointments/add" element={<AppointmentForm />} />
                <Route path="/appointments/:id" element={<AppointmentDetail />} />
                <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
                
                <Route path="/records" element={<MedicalRecordList />} />
                <Route path="/records/add" element={<MedicalRecordForm />} />
                <Route path="/records/:id" element={<MedicalRecordDetail />} />
              </>
            )}
            
            {userRole === 'DOCTOR' && (
                <>
                <Route path="/my-appointments" element={<DoctorAppointments />} />
                <Route path="/availability" element={<DoctorAvailability />} />
                <Route path="/appointments/:id" element={<AppointmentDetail />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/records" element={<MedicalRecordList />} />
                <Route path="/records/:id" element={<MedicalRecordDetail />} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default AuthenticatedRoutes;