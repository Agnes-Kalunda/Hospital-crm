import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DoctorAvailability = () => {
 const { user } = useContext(AuthContext);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [availabilities, setAvailabilities] = useState([]);
 const [selectedDay, setSelectedDay] = useState(null);
 const [selectedDate, setSelectedDate] = useState(null);
 const [doctorId, setDoctorId] = useState(null);
 const [startTime, setStartTime] = useState('09:00');
 const [endTime, setEndTime] = useState('17:00');
 const [useSpecificDate, setUseSpecificDate] = useState(false);
 
 const days = [
   { id: 'MON', name: 'Monday' },
   { id: 'TUE', name: 'Tuesday' },
   { id: 'WED', name: 'Wednesday' },
   { id: 'THU', name: 'Thursday' },
   { id: 'FRI', name: 'Friday' },
   { id: 'SAT', name: 'Saturday' },
   { id: 'SUN', name: 'Sunday' },
 ];
 
 const generateTimeSlots = () => {
   const slots = [];
   for (let hour = 8; hour < 18; hour++) {
     const formattedHour = hour.toString().padStart(2, '0');
     slots.push(`${formattedHour}:00`);
     slots.push(`${formattedHour}:30`);
   }
   return slots;
 };
 
 const timeSlots = generateTimeSlots();
 
 const getCurrentWeekDates = () => {
   const today = new Date();
   const day = today.getDay(); 
   const diff = day === 0 ? 6 : day - 1; 
   
   const monday = new Date(today);
   monday.setDate(today.getDate() - diff);
   
   const weekDates = [];
   for (let i = 0; i < 7; i++) {
     const date = new Date(monday);
     date.setDate(monday.getDate() + i);
     weekDates.push(date);
   }
   
   return weekDates;
 };
 
 const getNextOccurrenceOfDay = (dayOfWeek) => {
   const dayMapping = { 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6, 'SUN': 0 };
   const today = new Date();
   const todayDayNum = today.getDay(); 
   const targetDayNum = dayMapping[dayOfWeek];
   
   let daysToAdd = targetDayNum - todayDayNum;
   if (daysToAdd <= 0) {
     daysToAdd += 7;
   }
   
   const nextDate = new Date(today);
   nextDate.setDate(today.getDate() + daysToAdd);
   return nextDate;
 };
 
 useEffect(() => {
   const fetchDoctorData = async () => {
     setLoading(true);
     try {
       const res = await axios.get('/api/doctors/');
       
       const doctorRecord = res.data.find(d => 
         (user?.first_name && d.first_name === user.first_name) || 
         res.data[0] 
       );
       
       if (doctorRecord) {
         setDoctorId(doctorRecord.id);
         fetchAvailability(doctorRecord.id);
       } else {
         toast.error('Could not find your doctor record');
         setLoading(false);
       }
     } catch (err) {
       console.error('Error fetching doctor data:', err);
       toast.error('Failed to load doctor information');
       setLoading(false);
     }
   };
   
   fetchDoctorData();
 }, [user]);
 
 const formatTimeString = (timeStr) => {
   if (!timeStr) return '';
   
   if (timeStr.includes(':')) {
     return timeStr.split(':').slice(0, 2).join(':');
   }
   return timeStr;
 };
 
 const fetchAvailability = async (id) => {
   setLoading(true);
   try {
     const res = await axios.get(`/api/doctors/${id}/availabilities/`);
     
     const formattedAvailabilities = res.data.map(avail => ({
       ...avail,
       start_time: formatTimeString(avail.start_time),
       end_time: formatTimeString(avail.end_time)
     }));
     
     setAvailabilities(formattedAvailabilities);
     
     if (selectedDay) {
       const updatedAvailability = formattedAvailabilities.find(a => 
         a.day_of_week === selectedDay.id && 
         (!useSpecificDate || 
          (a.specific_date && new Date(a.specific_date).toDateString() === selectedDate.toDateString()))
       );
       if (updatedAvailability) {
         setStartTime(updatedAvailability.start_time);
         setEndTime(updatedAvailability.end_time);
       }
     }
   } catch (err) {
     console.error('Error fetching availabilities:', err);
     toast.error('Failed to load availability data');
   } finally {
     setLoading(false);
   }
 };
 
 const handleDaySelect = (day) => {
   if (!day) return;
   
   setSelectedDay(day);
   setUseSpecificDate(false);
   setSelectedDate(null);
   
   const existingAvailability = getAvailabilityForDay(day.id);
   if (existingAvailability) {
     setStartTime(existingAvailability.start_time);
     setEndTime(existingAvailability.end_time);
   } else {
     setStartTime('09:00');
     setEndTime('17:00');
   }
 };
 
 const handleSpecificDateSelect = (date) => {
   setSelectedDate(date);
   setUseSpecificDate(true);
   
   const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
   const dayObj = days.find(d => d.id === dayOfWeek);
   
   if (dayObj) {
     setSelectedDay(dayObj);
   }
   
   const existingAvailability = availabilities.find(a => 
     a.specific_date && new Date(a.specific_date).toDateString() === date.toDateString()
   );
   
   if (existingAvailability) {
     setStartTime(existingAvailability.start_time);
     setEndTime(existingAvailability.end_time);
   } else {
     const dayAvailability = getAvailabilityForDay(dayOfWeek);
     if (dayAvailability) {
       setStartTime(dayAvailability.start_time);
       setEndTime(dayAvailability.end_time);
     } else {
       setStartTime('09:00');
       setEndTime('17:00');
     }
   }
 };
 
 const getAvailabilityForDay = (dayId) => {
   return availabilities.find(a => a.day_of_week === dayId && !a.specific_date);
 };
 
 const getAvailabilityForDate = (date) => {
   if (!date) return null;
   return availabilities.find(a => 
     a.specific_date && new Date(a.specific_date).toDateString() === date.toDateString()
   );
 };
 
 const saveAvailability = async (start, end) => {
   if (!selectedDay || !doctorId) {
     toast.error('Please select a day first');
     return;
   }
   
   if (start >= end) {
     toast.error('End time must be after start time');
     return;
   }
   
   setSaving(true);
   try {
     let availability;
     
     if (useSpecificDate && selectedDate) {
       availability = getAvailabilityForDate(selectedDate);
     } else {
       availability = getAvailabilityForDay(selectedDay.id);
     }
     
     if (availability) {
       await axios.delete(`/api/doctors/${doctorId}/remove_availability/?availability_id=${availability.id}`);
     }
     
     const payload = {
       day_of_week: selectedDay.id,
       start_time: start,
       end_time: end
     };
     
     if (useSpecificDate && selectedDate) {
       payload.specific_date = selectedDate.toISOString().split('T')[0];
     }
     
     await axios.post(`/api/doctors/${doctorId}/add_availability/`, payload);
     
     if (useSpecificDate && selectedDate) {
       toast.success(`Updated availability for ${selectedDate.toLocaleDateString()}`);
     } else {
       toast.success(`Updated availability for ${selectedDay.name}`);
     }
     
     setStartTime(start);
     setEndTime(end);
     
     await fetchAvailability(doctorId);
   } catch (err) {
     console.error('Error saving availability:', err);
     toast.error(`Failed to save availability: ${err.response?.data?.detail || err.message}`);
   } finally {
     setSaving(false);
   }
 };
 
 const handleRemoveAvailability = async () => {
   if (!selectedDay || !doctorId) return;
   
   let availability;
   
   if (useSpecificDate && selectedDate) {
     availability = getAvailabilityForDate(selectedDate);
   } else {
     availability = getAvailabilityForDay(selectedDay.id);
   }
   
   if (!availability) {
     toast.info('No availability set for this day');
     return;
   }
   
   setSaving(true);
   try {
     await axios.delete(`/api/doctors/${doctorId}/remove_availability/?availability_id=${availability.id}`);
     
     if (useSpecificDate && selectedDate) {
       toast.success(`Removed availability for ${selectedDate.toLocaleDateString()}`);
     } else {
       toast.success(`Removed availability for ${selectedDay.name}`);
     }
     
     fetchAvailability(doctorId);
     setSelectedDay(null);
     setSelectedDate(null);
     setUseSpecificDate(false);
   } catch (err) {
     console.error('Error removing availability:', err);
     toast.error(`Failed to remove availability: ${err.response?.data?.detail || err.message}`);
   } finally {
     setSaving(false);
   }
 };
 
 const isSlotInRange = (time, startTime, endTime) => {
   const [hours, minutes] = time.split(':').map(Number);
   const [startHours, startMinutes] = startTime.split(':').map(Number);
   const [endHours, endMinutes] = endTime.split(':').map(Number);
   
   const timeValue = hours * 60 + minutes;
   const startValue = startHours * 60 + startMinutes;
   const endValue = endHours * 60 + endMinutes;
   
   return timeValue >= startValue && timeValue < endValue;
 };
 
 const formatDate = (dateStr) => {
   if (!dateStr) return '';
   const date = new Date(dateStr);
   return date.toLocaleDateString();
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
     <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Availability</h2>
     
     <p className="mb-6 text-gray-600">
       Select days of the week or specific dates to set your available hours for patient appointments.
     </p>
     
     <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
       <div className="p-6">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Schedule</h3>
         
         <div className="grid grid-cols-7 gap-2 mb-6">
           {days.map((day, index) => {
             const isAvailable = getAvailabilityForDay(day.id);
             const isSelected = selectedDay && selectedDay.id === day.id && !useSpecificDate;
             const dateObj = getCurrentWeekDates()[index];
             const formattedDate = dateObj.toLocaleDateString('en-US', { 
               month: 'short', 
               day: 'numeric' 
             });
             
             return (
               <button
                 key={day.id}
                 onClick={() => handleDaySelect(day)}
                 className={`py-3 text-center rounded-md transition-colors ${
                   isSelected
                     ? 'bg-indigo-600 text-white'
                     : isAvailable
                       ? 'bg-green-100 text-green-800'
                       : 'bg-gray-100 text-gray-800'
                 }`}
               >
                 <div className="font-medium">{day.name.slice(0, 3)}</div>
                 <div className="text-xs mt-1">{formattedDate}</div>
                 {isAvailable && (
                   <div className="text-xs mt-1">
                     {isAvailable.start_time} - {isAvailable.end_time}
                   </div>
                 )}
               </button>
             );
           })}
         </div>
         
         <div className="mb-6">
           <h3 className="text-lg font-medium text-gray-900 mb-2">Specific Date Availability</h3>
           <div className="flex space-x-4">
             <div className="flex-1">
               <DatePicker
                 selected={selectedDate}
                 onChange={handleSpecificDateSelect}
                 className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 placeholderText="Select a specific date"
                 dateFormat="yyyy-MM-dd"
                 minDate={new Date()}
               />
             </div>
             {selectedDate && (
               <button
                 onClick={() => {
                   setSelectedDate(null);
                   setUseSpecificDate(false);
                 }}
                 className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
               >
                 Clear Date
               </button>
             )}
           </div>
         </div>
         
         {selectedDay && (
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-medium text-gray-900">
                 {useSpecificDate && selectedDate 
                   ? `${selectedDay.name}, ${selectedDate.toLocaleDateString()}`
                   : selectedDay.name}
               </h3>
               <button
                 onClick={() => {
                   setSelectedDay(null);
                   setSelectedDate(null);
                   setUseSpecificDate(false);
                 }}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
             
             <p className="text-sm text-gray-600 mb-4">
               {useSpecificDate && selectedDate
                 ? `Set your availability for ${selectedDay.name}, ${selectedDate.toLocaleDateString()} or choose from common presets.`
                 : `Set your availability for ${selectedDay.name} or choose from common presets.`}
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
               <button
                 onClick={() => {
                   setStartTime('09:00');
                   setEndTime('17:00');
                   saveAvailability('09:00', '17:00');
                 }}
                 className="py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                 disabled={saving}
               >
                 Full Day (9AM-5PM)
               </button>
               <button
                 onClick={() => {
                   setStartTime('08:00');
                   setEndTime('12:00');
                   saveAvailability('08:00', '12:00');
                 }}
                 className="py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                 disabled={saving}
               >
                 Morning (8AM-12PM)
               </button>
               <button
                 onClick={() => {
                   setStartTime('13:00');
                   setEndTime('17:00');
                   saveAvailability('13:00', '17:00');
                 }}
                 className="py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                 disabled={saving}
               >
                 Afternoon (1PM-5PM)
               </button>
             </div>
             
             <div className="mb-6">
               <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Hours</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label htmlFor="start_time" className="block text-xs text-gray-500 mb-1">Start Time</label>
                   <select
                     id="start_time"
                     className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     value={startTime}
                     onChange={(e) => {
                       const newStartTime = e.target.value;
                       setStartTime(newStartTime);
                       
                       if (newStartTime >= endTime) {
                         const startTimeIndex = timeSlots.indexOf(newStartTime);
                         if (startTimeIndex < timeSlots.length - 1) {
                           setEndTime(timeSlots[startTimeIndex + 1]);
                         }
                       }
                     }}
                   >
                     {timeSlots.map(time => (
                       <option key={`start-${time}`} value={time}>{time}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label htmlFor="end_time" className="block text-xs text-gray-500 mb-1">End Time</label>
                   <select
                     id="end_time"
                     className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     value={endTime}
                     onChange={(e) => {
                       const newEndTime = e.target.value;
                       setEndTime(newEndTime);
                       
                       if (startTime >= newEndTime) {
                         const endTimeIndex = timeSlots.indexOf(newEndTime);
                         if (endTimeIndex > 0) {
                           setStartTime(timeSlots[endTimeIndex - 1]);
                         }
                       }
                     }}
                   >
                     {timeSlots.map(time => (
                       <option key={`end-${time}`} value={time}>{time}</option>
                     ))}
                   </select>
                 </div>
               </div>
               <button
                 onClick={() => saveAvailability(startTime, endTime)}
                 className="mt-3 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 disabled={saving}
               >
                 {saving ? 'Saving...' : 'Save Custom Hours'}
               </button>
             </div>
             
             <div>
               <h4 className="text-sm font-medium text-gray-700 mb-2">Time Slots</h4>
               <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 border rounded-md p-4 bg-white">
                 {timeSlots.map(time => {
                   const isInRange = isSlotInRange(time, startTime, endTime);
                   
                   return (
                     <div
                       key={time}
                       className={`py-2 px-3 text-center text-sm rounded-md ${
                         isInRange
                           ? 'bg-green-100 text-green-800'
                           : 'bg-gray-100 text-gray-500'
                       }`}
                     >
                       {time}
                     </div>
                   );
                 })}
               </div>
             </div>
             
             {(useSpecificDate && getAvailabilityForDate(selectedDate)) || 
              (!useSpecificDate && getAvailabilityForDay(selectedDay.id)) ? (
               <button
                 onClick={handleRemoveAvailability}
                 className="mt-6 py-2 px-4 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                 disabled={saving}
               >
                 {saving ? 'Removing...' : useSpecificDate && selectedDate
                   ? `Remove Availability for ${selectedDate.toLocaleDateString()}`
                   : `Remove Availability for ${selectedDay.name}`}
               </button>
             ) : null}
           </div>
         )}
       </div>
     </div>
     
     <div className="bg-white shadow-md rounded-lg overflow-hidden">
       <div className="px-6 py-4 border-b border-gray-200">
         <h3 className="text-lg font-medium text-gray-900">Current Availability</h3>
       </div>
       
       <div className="p-6">
         {availabilities.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Day
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Date
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Start Time
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     End Time
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {availabilities.map(availability => {
                   const dayObj = days.find(d => d.id === availability.day_of_week);
                   return (
                     <tr key={availability.id}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {dayObj ? dayObj.name : availability.day_of_week}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {availability.specific_date ? 
                           new Date(availability.specific_date).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric'
                           }) : 
                           <>
                             {getNextOccurrenceOfDay(availability.day_of_week).toLocaleDateString('en-US', {
                               month: 'short',
                               day: 'numeric',
                               year: 'numeric'
                             })}
                             <span className="ml-1 text-xs text-indigo-500">(Weekly)</span>
                           </>
                         }
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {availability.start_time}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {availability.end_time}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <button
                           onClick={() => {
                             const dayObj = days.find(d => d.id === availability.day_of_week);
                             if (dayObj) {
                               if (availability.specific_date) {
                                 setSelectedDate(new Date(availability.specific_date));
                                 setUseSpecificDate(true);
                                 handleDaySelect(dayObj);
                               } else {
                                 setSelectedDate(null);
                                 setUseSpecificDate(false);
                                 handleDaySelect(dayObj);
                               }
                             }
                           }}
                           className="text-indigo-600 hover:text-indigo-900"
                         >
                           Edit
                         </button>
                         <span className="mx-2 text-gray-300">|</span>
                         <button
                           onClick={() => {
                             setSaving(true);
                             axios.delete(`/api/doctors/${doctorId}/remove_availability/?availability_id=${availability.id}`)
                               .then(() => {
                                 const dayObj = days.find(d => d.id === availability.day_of_week);
                                 const dayName = dayObj ? dayObj.name : availability.day_of_week;
                                 
                                 if (availability.specific_date) {
                                   toast.success(`Removed availability for ${dayName}, ${formatDate(availability.specific_date)}`);
                                 } else {
                                   toast.success(`Removed availability for ${dayName}`);
                                 }
                                 
                                 fetchAvailability(doctorId);
                               })
                               .catch(err => {
                                 console.error('Error removing availability:', err);
                                 toast.error(`Failed to remove availability: ${err.response?.data?.detail || err.message}`);
                               })
                               .finally(() => {
                                 setSaving(false);
                               });
                           }}
                           className="text-red-600 hover:text-red-900"
                           disabled={saving}
                         >
                           Delete
                         </button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="text-center py-6">
             <p className="text-gray-500">No availability set yet. Select a day above to add your availability.</p>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default DoctorAvailability;