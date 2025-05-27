import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const MedicalRecordList = () => {
 const [records, setRecords] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterPatient, setFilterPatient] = useState('');
 
 const { user, userRole } = useContext(AuthContext);
 
 useEffect(() => {
   const fetchRecords = async () => {
     try {
       let url = '/api/records/';
       
       if (userRole === 'DOCTOR') {
          url = `/api/doctors/my_records/`;
      }
       
       const res = await axios.get(url);
       setRecords(res.data);
       setLoading(false);
     } catch (err) {
       console.error('Error fetching medical records:', err);
       setError('Failed to load medical records');
       setLoading(false);
     }
   };
   
   fetchRecords();
 }, [user, userRole]);
 
 const handleSearch = (e) => {
   setSearchTerm(e.target.value);
 };
 
 const handlePatientFilter = (e) => {
   setFilterPatient(e.target.value);
 };
 
 const filteredRecords = records.filter(record => {
   const matchesSearch = 
     (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (record.symptoms && record.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (record.patient_details && 
       `${record.patient_details.first_name} ${record.patient_details.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
   
   const matchesPatientFilter = !filterPatient || 
     (record.patient === parseInt(filterPatient) || 
      (record.patient_details && record.patient_details.id === parseInt(filterPatient)));
   
   return matchesSearch && matchesPatientFilter;
 });
 
 if (loading) return <Spinner />;
 if (error) return <div className="alert alert-danger">{error}</div>;
 
 return (
   <div>
     <div className="flex justify-between items-center mb-6">
       <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
       {userRole !== 'DOCTOR' && (
         <Link 
           to="/records/add"
           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
           </svg>
           Add Medical Record
         </Link>
       )}
     </div>
     
     <div className="bg-white shadow-md rounded-lg overflow-hidden">
       <div className="p-4 border-b border-gray-200 bg-gray-50">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Records</label>
             <div className="relative rounded-md shadow-sm">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                 </svg>
               </div>
               <input
                 type="text"
                 id="search"
                 className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                 placeholder="Search by diagnosis, symptoms or patient name..."
                 value={searchTerm}
                 onChange={handleSearch}
               />
             </div>
           </div>
         </div>
       </div>
       
       <div className="overflow-x-auto">
         {filteredRecords.length > 0 ? (
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Date
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Patient
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Doctor
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Diagnosis
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Actions
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredRecords.map(record => (
                 <tr key={record.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {new Date(record.created_at).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">
                       {record.patient_details ? 
                         `${record.patient_details.first_name} ${record.patient_details.last_name}` : 
                         'N/A'}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900">
                       {record.doctor_details ? 
                         `Dr. ${record.doctor_details.first_name} ${record.doctor_details.last_name}` : 
                         'N/A'}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {record.diagnosis || 'No diagnosis recorded'}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <Link to={`/records/${record.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                       View
                     </Link>
                     {userRole !== 'DOCTOR' && (
                       <Link to={`/records/${record.id}/edit`} className="text-amber-600 hover:text-amber-900">
                         Edit
                       </Link>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className="text-center py-10">
             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
             <p className="mt-1 text-sm text-gray-500">
               {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new medical record.'}
             </p>
             {userRole !== 'DOCTOR' && !searchTerm && (
               <div className="mt-6">
                 <Link
                   to="/records/add"
                   className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 >
                   <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                   </svg>
                   New Record
                 </Link>
               </div>
             )}
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default MedicalRecordList;