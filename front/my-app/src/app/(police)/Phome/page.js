'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCheckpoints = async () => {
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        return;
      }
      const response = await axios.get('http://localhost:3080/checkpoints', {
        params: { city: loggedInCity },
      });
      setCheckpoints(response.data);
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      setError('Failed to fetch checkpoint data');
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const pdetailsResponse = await axios.get('http://localhost:3080/attendance-records', {
        params: { city: loggedInCity },
      });
      const pdetails = pdetailsResponse.data;

      const attenResponse = await axios.get('http://localhost:3080/attendance-today', {
        params: {
          start: today.toISOString(),
          end: tomorrow.toISOString(),
          city: loggedInCity,
        },
      });
      const attenRecords = attenResponse.data;

      const presentPolicemen = attenRecords
        .filter(record => record.Attendace)
        .map(record => {
          const pdetail = pdetails.find(p => p.ID === record.ID);
          return {
            ...record,
            name: pdetail ? pdetail.name : 'Unknown',
          };
        });

      setAttendanceData(presentPolicemen);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to fetch attendance data');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCheckpoints(), fetchAttendanceData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate summary metrics
  const totalUploads = checkpoints.length;
  const actionTakenCount = checkpoints.filter(checkpoint => checkpoint.actionTaken === 'Action Taken').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col gap-6">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section: Today */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Today's Checkpoints</h2>
          </div>
          <div className="h-[32rem] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>
            ) : checkpoints.length > 0 ? (
              checkpoints.map((checkpoint, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <p className="text-gray-800">
                    <span className="font-semibold">Vehicle:</span> {checkpoint.vehicleNumber}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">City:</span> {checkpoint.city}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Time:</span> {new Date(checkpoint.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Status:</span>{' '}
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        checkpoint.actionTaken === 'Action Taken'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {checkpoint.actionTaken || 'Pending'}
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">No checkpoints submitted today</p>
            )}
          </div>
        </div>

        {/* Right Section: Past Actions and Trackings */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Today Past Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Past Actions</h2>
            </div>
            <div className="h-48 overflow-y-auto pr-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : checkpoints.length > 0 ? (
                checkpoints
                  .filter(checkpoint => checkpoint.actionTaken === 'Action Taken')
                  .map((checkpoint, index) => (
                    <p
                      key={index}
                      className="mb-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {checkpoint.vehicleNumber} - {checkpoint.city}
                    </p>
                  ))
              ) : (
                <p className="text-gray-600 italic">No past actions today</p>
              )}
            </div>
          </div>

          {/* Trackings */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Trackings</h2>
            </div>
            <div className="h-48 overflow-y-auto pr-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Summary Section */}
                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-gray-800 font-semibold">
                      Total Uploads Today:{' '}
                      <span className="text-indigo-600">{totalUploads}</span>
                    </p>
                    <p className="text-gray-800 font-semibold">
                      Action Taken:{' '}
                      <span className="text-indigo-600">{actionTakenCount}</span>
                    </p>
                  </div>
                  {/* Present Policemen List */}
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record, index) => (
                      <p
                        key={index}
                        className="mb-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                      >
                        {record.name} - {record.city}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-600 italic">No policemen marked present today</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}