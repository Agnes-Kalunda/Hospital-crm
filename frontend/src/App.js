import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/layout/MainLayout';
import './App.css';
import TailwindTest from './components/TailwindTest';

function App() {
  return (
    <Router>
      {/* <TailwindTest/> */}
      <MainLayout />
      <ToastContainer position="bottom-right" />
    </Router>
  );
}

export default App;