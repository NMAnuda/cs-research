'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function HistoryView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 for All Months
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loggedInCity, setLoggedInCity] = useState('');

  // Fetch history data
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const city = localStorage.getItem('loggedInCity');
      if (!city) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }
      setLoggedInCity(city);

      const params = { city };
      if (selectedMonth !== 0) {
        params.month = selectedMonth;
      }
      if (selectedYear) {
        params.year = selectedYear;
      }

      const response = await axios.get('http://localhost:3080/history', { params });
      setHistoryData(response.data);
    } catch (error) {
      console.error('Error fetching history data:', error);
      setError(error.response?.data?.error || error.message);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <Head>
        <title>History View - Police Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-black">
          <h1 className="text-3xl font-bold text-black text-center">History View - Police Dashboard</h1>
          <p className="text-black text-center mt-2">Violation and Check History for {loggedInCity}.</p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full text-center border border-black">
            <p className="text-black text-lg">Loading history...</p>
          </div>
        )}
        {error && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full text-center border border-black">
            <p className="text-red-600 text-lg">Error: {error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Month and Year Selection */}
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center gap-4 border border-black">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="monthSelect" className="text-black font-medium text-sm sm:text-base">
                  Select Month:
                </label>
                <select
                  id="monthSelect"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full sm:w-auto p-2.5 border border-black rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value={0}>All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <label htmlFor="yearSelect" className="text-black font-medium text-sm sm:text-base">
                  Select Year:
                </label>
                <input
                  id="yearSelect"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full sm:w-auto p-2.5 border border-black rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>

            {/* History List */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-black">
              <h2 className="text-xl font-semibold text-black mb-4">Violation and Check History</h2>
              {historyData.length === 0 ? (
                <p className="text-black text-center">No records found.</p>
              ) : (
                <div className="space-y-4">
                  {historyData.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      {/* Image */}
                      {entry.photoPath ? (
                        <div className="w-full sm:w-48 h-48 relative">
                          <img
                            src={entry.photoPath} // Use the full URL directly from the backend
                            alt={`Violation or Check Photo for ${entry.id}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              console.log('Error loading image:', entry.photoPath);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-48 h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1">
                        <p className="text-black font-medium">
                          Violation: {entry.violationType !== 'None' ? entry.violationType : 'N/A'}
                        </p>
                        <p className="text-black font-medium">
                          Item Found: {entry.issueType !== 'No Issues' ? entry.issueType : 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          Date: {new Date(entry.date).toLocaleString('default', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-gray-600">Policeman: {entry.policemanName}</p>
                        <p className="text-gray-600">City: {entry.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}