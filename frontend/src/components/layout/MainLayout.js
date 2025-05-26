import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthenticatedRoutes from '../routing/AuthenticatedRoutes';
import Login from '../auth/Login';
import Register from '../auth/Register';

const MainLayout = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<AuthenticatedRoutes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
};

export default MainLayout;