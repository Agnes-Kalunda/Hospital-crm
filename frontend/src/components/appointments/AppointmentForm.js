import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    appointment_datetime: null,
    status: 'SCHEDULED',
    reason: '',
    notes: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [backendErrors, setBackendErrors] = useState(null);
  const [doctorTimeRange, setDoctorTimeRange] = useState({ start: '', end: '' });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patient');
  const doctorIdFromQuery = queryParams.get('doctor');
  
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response || error);
        if (error.response?.status === 401) {
          toast.error('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    
    if (id) {
      setIsEdit(true);
      fetchAppointment();
    } else {
      if (patientIdFromQuery) {
        setFormData(prev => ({ ...prev, patient: patientIdFromQuery }));
      }
      if (doctorIdFromQuery) {
        setFormData(prev => ({ ...prev, doctor: doctorIdFromQuery }));
      }
    }
  }, [id, patientIdFromQuery, doctorIdFromQuery]);
  
  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      toast.error('Failed to load patients. Please refresh the page.');
    }
  };
  
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/doctors/');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast.error('Failed to load doctors. Please refresh the page.');
    }
  };
  
  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/appointments/${id}/`);
      const appointment = res.data;
      
      const appointmentDate = new Date(appointment.appointment_datetime);
      const formattedDate = appointmentDate.toISOString().split('T')[0];
      const formattedTime = appointmentDate.toTimeString().substring(0, 5);
      
      setFormData({
        ...appointment,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment_datetime: appointmentDate
      });
      
      setSelectedDate(formattedDate);
      setSelectedTime(formattedTime);
      
      fetchAvailableSlots(appointment.doctor, formattedDate);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      toast.error('Failed to load appointment data');
      setLoading(false);
      navigate('/appointments');
    }
  };
  
  const fetchAvailabilityForDate = async (doctorId, date) => {
    if (!doctorId || !date) return null;
    
    try {
      const dateObj = new Date(date);
      const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dateObj.getDay()];
      
      const availabilityRes = await axios.get(`/api/doctors/${doctorId}/availabilities/`);
      return availabilityRes.data.find(a => a.day_of_week === dayOfWeek);
    } catch (err) {
      console.error('Error fetching doctor availability:', err);
      return null;
    }
  };
  
  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
    try {
      setAvailableSlots([]);
      
      const availability = await fetchAvailabilityForDate(doctorId, date);
      
      if (availability) {
        setDoctorTimeRange({
          start: availability.start_time.substring(0, 5),
          end: availability.end_time.substring(0, 5)
        });
        
        const selectedDoctor = doctors.find(d => d.id.toString() === doctorId.toString());
        if (selectedDoctor) {
          const doctorName = `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`;
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          
          toast.info(`${doctorName} is available on ${dayName} between ${availability.start_time.substring(0, 5)} and ${availability.end_time.substring(0, 5)}`, {
            position: "top-center"
          });
        }
      }
      
      const res = await axios.get(`/api/doctors/${doctorId}/available_slots/?date=${date}`);
      
      if (res.data.available_slots.length === 0) {
        const selectedDoctor = doctors.find(d => d.id.toString() === doctorId.toString());
        if (selectedDoctor) {
          const doctorName = `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`;
          toast.warning(`${doctorName} has no available slots on the selected date`, {
            position: "top-center"
          });
        }
      }
      
      if (isEdit) {
        const currentTime = selectedTime;
        if (!res.data.available_slots.includes(currentTime)) {
          res.data.available_slots.push(currentTime);
          res.data.available_slots.sort();
        }
      }
      
      setAvailableSlots(res.data.available_slots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      
      if (err.response?.status === 404) {
        const selectedDoctor = doctors.find(d => d.id.toString() === doctorId.toString());
        if (selectedDoctor) {
          const doctorName = `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`;
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          toast.error(`${doctorName} is not available on ${dayName}`, {
            position: "top-center"
          });
        } else {
          toast.error(`The selected doctor doesn't have availability set for this date.`);
        }
      } else {
        toast.error('Failed to load available time slots. Please try another date.');
      }
      
      setAvailableSlots([]);
    }
  };
  
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
    
    if (backendErrors) {
      setBackendErrors(null);
    }
  };
  
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData(prev => ({
      ...prev,
      doctor: doctorId
    }));
    
    setDoctorTimeRange({ start: '', end: '' });
    
    if (selectedDate) {
      fetchAvailableSlots(doctorId, selectedDate);
    }
  };
  
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime('');
    
    if (formData.doctor) {
      fetchAvailableSlots(formData.doctor, date);
    }
  };
  
  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    setSelectedTime(timeValue);
    
    if (selectedDate) {
      const [hours, minutes] = timeValue.split(':');
      const dateObj = new Date(selectedDate);
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      setFormData(prev => ({
        ...prev,
        appointment_datetime: dateObj
      }));
      
      if (doctorTimeRange.start && doctorTimeRange.end) {
        if (timeValue < doctorTimeRange.start || timeValue > doctorTimeRange.end) {
          setFormErrors(prev => ({
            ...prev,
            appointment_time: `Appointment time must be between ${doctorTimeRange.start} and ${doctorTimeRange.end}`
          }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.appointment_time;
            return newErrors;
          });
        }
      }
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
    
    if (!selectedDate) {
      errors.appointment_date = 'Appointment date is required';
    }
    
    if (!selectedTime) {
      errors.appointment_time = 'Appointment time is required';
    }
    
    if (!formData.appointment_datetime && (selectedDate && selectedTime)) {
      errors.appointment_datetime = 'Invalid appointment date and time';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setBackendErrors(null);
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (doctorTimeRange.start && doctorTimeRange.end) {
      if (selectedTime < doctorTimeRange.start || selectedTime > doctorTimeRange.end) {

        setFormErrors(prev => ({
          ...prev,
          appointment_time: `Appointment time must be between ${doctorTimeRange.start} and ${doctorTimeRange.end}`
        }));
        return;
      }
    }
    
    setLoading(true);
    
    const payload = {
      patient: formData.patient,
      doctor: formData.doctor,
      appointment_datetime: formData.appointment_datetime.toISOString(),
      status: formData.status,
      reason: formData.reason || '',
      notes: formData.notes || ''
    };
    
    try {
      if (isEdit) {
        await axios.put(`/api/appointments/${id}/`, payload);
        toast.success('Appointment updated successfully');
        navigate('/appointments');
      } else {
        const response = await axios.post('/api/appointments/', payload);
        toast.success('Appointment scheduled successfully');
        navigate('/appointments');
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setLoading(false);
      
      const errorMessage = err.response?.data?.non_field_errors?.[0] || 
                           err.response?.data?.appointment_datetime?.[0] ||
                           err.response?.data?.detail;
                           
      if (errorMessage && errorMessage.includes("between")) {
        toast.error(errorMessage);
        setFormErrors(prev => ({
          ...prev,
          appointment_time: errorMessage
        }));
      } else if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          setFormErrors(prev => ({
            ...prev,
            ...err.response.data
          }));
          
          Object.entries(err.response.data).forEach(([field, error]) => {
            if (Array.isArray(error)) {
              error.forEach(msg => toast.error(`${field}: ${msg}`));
            } else if (typeof error === 'string') {
              toast.error(`${field}: ${error}`);
            }
          });
        } else {
          setBackendErrors(err.response.data);
          toast.error('Server error: ' + (err.response.data || 'Failed to save appointment'));
        }
      } else {
        toast.error('Network error. Please try again later.');
      }
    }
  };
  
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">
        {isEdit ? 'Edit Appointment' : 'Schedule Appointment'}
      </h2>
      
      {backendErrors && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Server Error:</p>
          <p>{backendErrors}</p>
        </div>
      )}
      
      <div className="mt-6 bg-white shadow rounded-lg">
        {formData.doctor && doctorTimeRange.start && doctorTimeRange.end && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-blue-700 text-sm">
            Appointments for this doctor must be scheduled between {doctorTimeRange.start} and {doctorTimeRange.end}
          </div>
        )}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
                  Patient *
                </label>
                <div className="mt-1">
                  <select
                    id="patient"
                    name="patient"
                    className={`block w-full rounded-md border ${formErrors.patient ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    value={formData.patient}
                    onChange={handleChange}
                    disabled={isEdit}
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
              
              <div className="sm:col-span-3">
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                  Doctor *
                </label>
                <div className="mt-1">
                  <select
                    id="doctor"
                    name="doctor"
                    className={`block w-full rounded-md border ${formErrors.doctor ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    value={formData.doctor}
                    onChange={handleDoctorChange}
                    disabled={isEdit}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                      </option>
                    ))}
                  </select>
                  {formErrors.doctor && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.doctor}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">
                  Appointment Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="appointment_date"
                    min={today}
                    value={selectedDate}
                    onChange={handleDateChange}
                    className={`block w-full rounded-md border ${
                      formErrors.appointment_date ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  />
                  {formErrors.appointment_date && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.appointment_date}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700">
                  Appointment Time *
                </label>
                <div className="mt-1">
                  <select
                    id="appointment_time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className={`block w-full rounded-md border ${
                      formErrors.appointment_time ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    disabled={!selectedDate || !formData.doctor || availableSlots.length === 0}
                  >
                    <option value="">Select Time</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {formErrors.appointment_time && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.appointment_time}</p>
                  )}
                  {formData.doctor && selectedDate && availableSlots.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No available slots for the selected date. {doctorTimeRange.start && doctorTimeRange.end && `Please note that appointments must be within the doctor's available hours (${doctorTimeRange.start}-${doctorTimeRange.end}).`}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
{/*               
              <div className="sm:col-span-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Appointment
                </label>
                <div className="mt-1">
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.reason || ''}
                    onChange={handleChange}
                  />
                </div>
              </div> */}
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {formErrors.appointment_datetime && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {formErrors.appointment_datetime}
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => navigate('/appointments')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Appointment' : 'Schedule Appointment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;