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
      const response = await axios.get('http://localhost:3080/checkpoints');
      setCheckpoints(response.data);
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      setError('Failed to fetch checkpoint data');
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const pdetailsResponse = await axios.get('http://localhost:3080/attendance-records');
      const pdetails = pdetailsResponse.data;

      const attenResponse = await axios.get('http://localhost:3080/attendance-today', {
        params: {
          start: today.toISOString(),
          end: tomorrow.toISOString(),
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

  return (
    <div className="h-full bg-white flex p-4 gap-4">
      {/* Left Section: Today */}
      <div className="w-2/3 bg-white border border-black rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2 text-black">Today</h2>
        <div className="h-96">
          {loading ? (
            <p className="text-black">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : checkpoints.length > 0 ? (
            checkpoints.map((checkpoint, index) => (
              <div key={index} className="mb-2 p-2 border-b border-black">
                <p className="text-black"><strong>Vehicle:</strong> {checkpoint.vehicleNumber}</p>
                <p className="text-black"><strong>City:</strong> {checkpoint.city}</p>
                <p className="text-black"><strong>Time:</strong> {new Date(checkpoint.createdAt).toLocaleTimeString()}</p>
                <p className="text-black"><strong>Status:</strong> {checkpoint.actionTaken || 'Pending'}</p>
              </div>
            ))
          ) : (
            <p className="text-black">No checkpoints submitted today</p>
          )}
        </div>
      </div>

      {/* Right Section: Today Past actions and Trakings */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Today Past actions */}
        <div className="bg-white border border-black rounded-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2 text-black">Today Past actions</h2>
          <div className="h-48">
            {loading ? (
              <p className="text-black">Loading...</p>
            ) : checkpoints.length > 0 ? (
              checkpoints
                .filter(checkpoint => checkpoint.actionTaken === 'Action Taken')
                .map((checkpoint, index) => (
                  <p key={index} className="mb-1 text-black">
                    {checkpoint.vehicleNumber} - {checkpoint.city}
                  </p>
                ))
            ) : (
              <p className="text-black">No past actions today</p>
            )}
          </div>
        </div>

        {/* Trakings */}
        <div className="bg-white border border-black rounded-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2 text-black">Trakings</h2>
          <div className="h-48">
            {loading ? (
              <p className="text-black">Loading...</p>
            ) : attendanceData.length > 0 ? (
              attendanceData.map((record, index) => (
                <p key={index} className="mb-1 text-black">
                  {record.name} - {record.city}
                </p>
              ))
            ) : (
              <p className="text-black">No policemen marked present today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}