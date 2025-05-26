import React from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Staff Dashboard</h2>
      <p className="mt-4">Welcome to the staff portal. From here you can manage patients and schedule appointments.</p>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Patient Registration</h3>
            <p className="mt-2 text-sm text-gray-500">Register new patients and manage their information</p>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <Link to="/patients/add" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Register New Patient →
            </Link>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Schedule Appointments</h3>
            <p className="mt-2 text-sm text-gray-500">Book appointments for patients with available doctors</p>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <Link to="/appointments/add" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Schedule Appointment →
            </Link>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">View All Patients</h3>
            <p className="mt-2 text-sm text-gray-500">View and manage all registered patients</p>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <Link to="/patients" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View Patients →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;