import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    
    setLoading(false);
    setTodayAppointments([
      {
        id: 1,
        appointment_datetime: new Date().toISOString(),
        patient_details: { first_name: 'John', last_name: 'Doe' },
        status: 'SCHEDULED',
        status_display: 'Scheduled',
        reason: 'Regular checkup'
      }
    ]);
    

    /*
    const fetchTodayAppointments = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(`/api/appointments/?date=${today}&doctor=${user.id}`);
        setTodayAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setLoading(false);
      }
    };
    
    fetchTodayAppointments();
    */
  }, []);
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h2>
      <p className="mt-4">Welcome to your dashboard, Dr. {user?.first_name || 'Doctor'}. Here you can manage your appointments and availability.</p>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">My Appointments</h3>
            <p className="mt-2 text-sm text-gray-500">View and manage your appointments</p>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <Link to="/my-appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View Appointments →
            </Link>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Manage Availability</h3>
            <p className="mt-2 text-sm text-gray-500">Set your working hours and available time slots</p>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <Link to="/availability" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Manage Availability →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
        
        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading appointments...</p>
        ) : todayAppointments.length > 0 ? (
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
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
                      {todayAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(appointment.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                            <Link to={`/appointments/${appointment.id}`} className="text-indigo-600 hover:text-indigo-900">
                              View
                            </Link>
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
          <p className="mt-4 text-sm text-gray-500">No appointments scheduled for today.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;