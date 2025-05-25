import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };
  
  return (
    <div className="position-sticky pt-3">
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/patients')}`} to="/patients">
            <i className="bi bi-people me-2"></i>
            Patients
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/doctors')}`} to="/doctors">
            <i className="bi bi-person-badge me-2"></i>
            Doctors
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/appointments')}`} to="/appointments">
            <i className="bi bi-calendar-check me-2"></i>
            Appointments
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/records')}`} to="/records">
            <i className="bi bi-file-medical me-2"></i>
            Medical Records
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;