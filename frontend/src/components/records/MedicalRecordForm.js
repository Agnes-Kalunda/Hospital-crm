import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const MedicalRecordForm = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const { user, userRole } = useContext(AuthContext);
 const queryParams = new URLSearchParams(location.search);
 const patientId = queryParams.get('patient');

 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [patients, setPatients] = useState([]);
 const [doctors, setDoctors] = useState([]);
 const [appointments, setAppointments] = useState([]);
 const [currentDoctor, setCurrentDoctor] = useState(null);

 const [formData, setFormData] = useState({
   patient: patientId || '',
   doctor: '',
   appointment: '',
   diagnosis: '',
   symptoms: '',
   prescription: '',
   notes: ''
 });

 const [formErrors, setFormErrors] = useState({});

 useEffect(() => {
   const fetchInitialData = async () => {
     setLoading(true);
     try {
       const patientsRes = await axios.get('/api/patients/');
       setPatients(patientsRes.data);

       const doctorsRes = await axios.get('/api/doctors/');
       setDoctors(doctorsRes.data);
       
       const doctorUser = doctorsRes.data.find(d => d.user === user?.id || d.email === user?.email);
       if (doctorUser) {
         setCurrentDoctor(doctorUser);
         setFormData(prev => ({
           ...prev,
           doctor: doctorUser.id
         }));
       }

       if (patientId) {
         const appointmentsRes = await axios.get(`/api/appointments/?patient=${patientId}`);
         setAppointments(appointmentsRes.data);
       }

       if (id) {
         const recordRes = await axios.get(`/api/records/${id}/`);
         const record = recordRes.data;

         setFormData({
           patient: record.patient,
           doctor: record.doctor,
           appointment: record.appointment || '',
           diagnosis: record.diagnosis || '',
           symptoms: record.symptoms || '',
           prescription: record.prescription || '',
           notes: record.notes || ''
         });

         if (record.patient && !patientId) {
           const appointmentsRes = await axios.get(`/api/appointments/?patient=${record.patient}`);
           setAppointments(appointmentsRes.data);
         }
       }

       setLoading(false);
     } catch (err) {
       console.error('Error fetching data:', err);
       toast.error('Failed to load necessary data');
       setLoading(false);
     }
   };

   fetchInitialData();
 }, [id, patientId, user]);

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));

   if (formErrors[name]) {
     setFormErrors(prev => ({
       ...prev,
       [name]: null
     }));
   }
 };

 const handlePatientChange = async (e) => {
   const patientId = e.target.value;
   setFormData(prev => ({
     ...prev,
     patient: patientId,
     appointment: ''
   }));

   if (patientId) {
     try {
       const appointmentsRes = await axios.get(`/api/appointments/?patient=${patientId}`);
       setAppointments(appointmentsRes.data);
     } catch (err) {
       console.error('Error fetching patient appointments:', err);
       toast.error('Failed to load patient appointments');
     }
   } else {
     setAppointments([]);
   }
 };

 const validateForm = () => {
   const errors = {};

   if (!formData.patient) {
     errors.patient = 'Patient is required';
   }

   if (!formData.doctor) {
     errors.doctor = 'Doctor is required';
   }

   if (!formData.diagnosis && !formData.symptoms) {
     errors.diagnosis = 'Either diagnosis or symptoms must be provided';
     errors.symptoms = 'Either diagnosis or symptoms must be provided';
   }

   setFormErrors(errors);
   return Object.keys(errors).length === 0;
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   if (!validateForm()) {
     toast.error('Please fix the errors in the form');
     return;
   }

   setSaving(true);
   try {
     if (id) {
       await axios.put(`/api/records/${id}/`, formData);
       toast.success('Medical record updated successfully');
     } else {
       await axios.post('/api/records/', formData);
       toast.success('Medical record created successfully');
     }

     if (patientId) {
       navigate(`/patients/${patientId}`);
     } else {
       navigate('/records');
     }
   } catch (err) {
     console.error('Error saving medical record:', err);
     
     if (err.response?.data) {
       setFormErrors(err.response.data);
       
       const firstError = Object.values(err.response.data)[0];
       if (firstError) {
         toast.error(typeof firstError === 'string' ? firstError : firstError[0]);
       } else {
         toast.error('Failed to save medical record');
       }
     } else {
       toast.error('Failed to save medical record');
     }
     
     setSaving(false);
   }
 };

 if (loading) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
     </div>
   );
 }

 return (
   <div>
     <h2 className="text-2xl font-semibold text-gray-900 mb-4">
       {id ? 'Edit Medical Record' : 'Create Medical Record'}
     </h2>

     <div className="bg-white shadow-md rounded-lg overflow-hidden">
       <div className="p-6">
         <form onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
             <div className="sm:col-span-6">
               <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
                 Patient *
               </label>
               <div className="mt-1">
                 <select
                   id="patient"
                   name="patient"
                   value={formData.patient}
                   onChange={handlePatientChange}
                   disabled={!!patientId}
                   className={`block w-full rounded-md border ${
                     formErrors.patient ? 'border-red-300' : 'border-gray-300'
                   } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                 >
                   <option value="">Select Patient</option>
                   {patients.map(patient => (
                     <option key={patient.id} value={patient.id}>
                       {patient.first_name} {patient.last_name}
                     </option>
                   ))}
                 </select>
                 {formErrors.patient && (
                   <p className="mt-2 text-sm text-red-600">{formErrors.patient}</p>
                 )}
               </div>
             </div>

             <div className="sm:col-span-6">
               <label htmlFor="appointment" className="block text-sm font-medium text-gray-700">
                 Related Appointment
               </label>
               <div className="mt-1">
                 <select
                   id="appointment"
                   name="appointment"
                   value={formData.appointment}
                   onChange={handleChange}
                   className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 >
                   <option value="">None</option>
                   {appointments.map(appointment => (
                     <option key={appointment.id} value={appointment.id}>
                       {new Date(appointment.appointment_datetime).toLocaleString()} with Dr. {appointment.doctor_details.first_name} {appointment.doctor_details.last_name}
                     </option>
                   ))}
                 </select>
               </div>
             </div>

             <div className="sm:col-span-6">
               <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                 Diagnosis
               </label>
               <div className="mt-1">
                 <textarea
                   id="diagnosis"
                   name="diagnosis"
                   rows={3}
                   value={formData.diagnosis}
                   onChange={handleChange}
                   className={`block w-full rounded-md border ${
                     formErrors.diagnosis ? 'border-red-300' : 'border-gray-300'
                   } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                 ></textarea>
                 {formErrors.diagnosis && (
                   <p className="mt-2 text-sm text-red-600">{formErrors.diagnosis}</p>
                 )}
               </div>
             </div>

             <div className="sm:col-span-6">
               <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                 Symptoms
               </label>
               <div className="mt-1">
                 <textarea
                   id="symptoms"
                   name="symptoms"
                   rows={3}
                   value={formData.symptoms}
                   onChange={handleChange}
                   className={`block w-full rounded-md border ${
                     formErrors.symptoms ? 'border-red-300' : 'border-gray-300'
                   } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                 ></textarea>
                 {formErrors.symptoms && (
                   <p className="mt-2 text-sm text-red-600">{formErrors.symptoms}</p>
                 )}
               </div>
             </div>

             <div className="sm:col-span-6">
               <label htmlFor="prescription" className="block text-sm font-medium text-gray-700">
                 Prescription
               </label>
               <div className="mt-1">
                 <textarea
                   id="prescription"
                   name="prescription"
                   rows={3}
                   value={formData.prescription}
                   onChange={handleChange}
                   className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 ></textarea>
               </div>
             </div>

             <div className="sm:col-span-6">
               <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                 Additional Notes
               </label>
               <div className="mt-1">
                 <textarea
                   id="notes"
                   name="notes"
                   rows={3}
                   value={formData.notes}
                   onChange={handleChange}
                   className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 ></textarea>
               </div>
             </div>
           </div>

           <div className="mt-6 flex justify-end space-x-3">
             <button
               type="button"
               onClick={() => patientId ? navigate(`/patients/${patientId}`) : navigate('/records')}
               className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={saving}
               className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
             >
               {saving ? 'Saving...' : id ? 'Update Record' : 'Create Record'}
             </button>
           </div>
         </form>
       </div>
     </div>
   </div>
 );
};

export default MedicalRecordForm;