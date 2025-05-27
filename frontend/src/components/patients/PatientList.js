import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const PatientList = () => {
 const [patients, setPatients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 
 const { user, userRole } = useContext(AuthContext);
 
 useEffect(() => {
   const fetchPatients = async () => {
     try {
       let url = '/api/patients/';
       
       if (userRole === 'DOCTOR') {
        url = `/api/doctors/my_patients/`;
    }
       
       const res = await axios.get(url);
       
       if (userRole === 'DOCTOR' && url.includes('appointments')) {
         const uniquePatients = [];
         const patientIds = new Set();
         
         res.data.forEach(appointment => {
           if (!patientIds.has(appointment.patient)) {
             patientIds.add(appointment.patient);
             uniquePatients.push(appointment.patient_details);
           }
         });
         
         setPatients(uniquePatients);
       } else {
         setPatients(res.data);
       }
       
       setLoading(false);
     } catch (err) {
       console.error('Error fetching patients:', err);
       setError('Failed to load patients');
       setLoading(false);
     }
   };
   
   fetchPatients();
 }, [user, userRole]);
 
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
       {userRole !== 'DOCTOR' && (
         <Link to="/patients/add" className="btn btn-primary">
           Add Patient
         </Link>
       )}
     </div>
     
     <div className="card">
       <div className="card-header">
         <div className="input-group">
           <span className="input-group-text">
             
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
                         View
                       </Link>
                       {userRole !== 'DOCTOR' && (
                         <Link to={`/patients/${patient.id}/edit`} className="btn btn-sm btn-warning me-2">
                           Edit
                         </Link>
                       )}
                       {userRole !== 'DOCTOR' && (
                         <Link to={`/appointments/add?patient=${patient.id}`} className="btn btn-sm btn-success">
                           Schedule
                         </Link>
                       )}
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