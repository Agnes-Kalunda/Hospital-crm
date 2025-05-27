import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const DoctorAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); 
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`/api/doctors/my_appointments/`);
        setAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_datetime);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return appointmentDate >= now;
    } else if (filter === 'past') {
      return appointmentDate < now;
    }
    return true; // 'all'
  });
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">My Appointments</h2>
      
      <div className="mt-4 mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700">
              View and manage all your scheduled appointments.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setFilter('upcoming')}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  filter === 'upcoming' 
                    ? 'bg-indigo-600 text-white border-transparent' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setFilter('past')}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  filter === 'past' 
                    ? 'bg-indigo-600 text-white border-transparent' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Past
              </button>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  filter === 'all' 
                    ? 'bg-indigo-600 text-white border-transparent' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center py-4">Loading appointments...</p>
      ) : filteredAppointments.length > 0 ? (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.appointment_datetime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_details.first_name} {appointment.patient_details.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.reason || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/appointments/${appointment.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            View
                          </Link>
                          {appointment.status === 'SCHEDULED' && (
                            <button className="text-green-600 hover:text-green-900">
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-white shadow-sm rounded-lg">
          <p className="text-gray-500">No {filter} appointments found.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;