'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastResetDate, setLastResetDate] = useState(null);

  useEffect(() => {
    
    const today = new Date().toISOString().split('T')[0]; 
    const storedDate = localStorage.getItem('lastResetDate');

    if (storedDate !== today) {
      
      fetchAttendanceData();
      localStorage.setItem('lastResetDate', today);
      setLastResetDate(today);
    } else {
      
      fetchAttendanceData();
      setLastResetDate(storedDate);
    }
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get('http://localhost:3080/attendance-records');
      if (response.status === 200) {
       
        const initializedData = response.data.map(record => ({
          ...record,
          Attendace: false, 
        }));
        setAttendanceData(initializedData);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err) {
      setError('Something went wrong while fetching attendance data');
    }
  };

  const handleAttendanceChange = (id, newAttendance) => {
    setAttendanceData(attendanceData.map(record =>
      record.ID === id ? { ...record, Attendace: newAttendance } : record
    ));
  };

  const handleSubmitAttendance = async () => {
    try {
      const response = await axios.put('http://localhost:3080/update-attendance', attendanceData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMessage(response.data.message);
        setAttendanceData(attendanceData.map(record => ({
          ...record,
          Attendace: false,
        })));
        setTimeout(() => setMessage(''), 3000); 
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit attendance');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">HR Attendance Management</h1>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record) => (
              <tr key={record.ID} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{record.name}</td>
                <td className="py-2 px-4 border-b">{record.ID}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={record.Attendace || false}
                    onChange={(e) => handleAttendanceChange(record.ID, e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {attendanceData.length === 0 && <p className="mt-4 text-center">No attendance records found.</p>}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmitAttendance}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
}