'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MonthlySummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch summary data
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:3080/monthly-summary', {
        params: {
          month: selectedMonth,
          year: selectedYear,
          city: loggedInCity,
        },
      });
      const { checkpoints, attendanceSummary } = response.data;
      setMonthlyData(checkpoints);
      setAttendanceSummary(attendanceSummary);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setError(error.response?.data?.error || error.message);
      setMonthlyData({});
      setAttendanceSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  // Generate PDF report
  const generatePDFReport = () => {
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        return;
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text(
        `Monthly Police Dashboard Summary - ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear} (${loggedInCity})`,
        14,
        20
      );

      // Monthly Overview
      doc.setFontSize(14);
      doc.text('Monthly Overview', 14, 30);
      autoTable(doc, {
        startY: 35,
        head: [['Metric', 'Value']],
        body: [
          ['Total Photos Uploaded', monthlyData.totalPhotos || 0],
          ['Total Violations', monthlyData.totalViolations || 0],
          ['Total Vehicle Checks', monthlyData.totalVehicleChecks || 0],
        ],
      });

      // Photos by Policeman
      let finalY = doc.lastAutoTable?.finalY || 35;
      doc.setFontSize(14);
      doc.text('Photos Uploaded by Policeman', 14, finalY + 10);
      const photosBody = Object.entries(monthlyData.photosByPoliceman || {}).map(([name, count]) => [name, count]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Policeman', 'Photos Uploaded']],
        body: photosBody.length > 0 ? photosBody : [['N/A', '0']],
      });

      // Violations by Policeman
      finalY = doc.lastAutoTable?.finalY || finalY + 15;
      doc.setFontSize(14);
      doc.text('Violations Caught by Policeman', 14, finalY + 10);
      const violationsBody = Object.entries(monthlyData.violationsByPoliceman || {}).map(([name, count]) => [name, count]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Policeman', 'Violations Caught']],
        body: violationsBody.length > 0 ? violationsBody : [['N/A', '0']],
      });

      // Vehicle Checks by Policeman
      finalY = doc.lastAutoTable?.finalY || finalY + 15;
      doc.setFontSize(14);
      doc.text('Vehicle Checks by Policeman', 14, finalY + 10);
      const checksBody = Object.entries(monthlyData.checksByPoliceman || {}).map(([name, count]) => [name, count]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Policeman', 'Vehicle Checks']],
        body: checksBody.length > 0 ? checksBody : [['N/A', '0']],
      });

      // Outdated or Illegal Items Caught by Policeman
      finalY = doc.lastAutoTable?.finalY || finalY + 15;
      doc.setFontSize(14);
      doc.text('Outdated/Illegal Items Caught by Policeman', 14, finalY + 10);
      const illegalItemsBody = Object.entries(monthlyData.illegalItemsByPoliceman || {}).map(([name, count]) => [name, count]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Policeman', 'Outdated/Illegal Items']],
        body: illegalItemsBody.length > 0 ? photosBody : [['N/A', '0']],
      });

      // Most Commonly Broken Rules
      finalY = doc.lastAutoTable?.finalY || finalY + 15;
      doc.setFontSize(14);
      doc.text('Most Commonly Broken Rules', 14, finalY + 10);
      const rulesBody = Object.entries(monthlyData.violationTypes || {}).map(([rule, count]) => [rule, count]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Violation Type', 'Count']],
        body: rulesBody.length > 0 ? rulesBody : [['N/A', '0']],
      });

      // Attendance Summary
      finalY = doc.lastAutoTable?.finalY || finalY + 15;
      doc.setFontSize(14);
      doc.text('Attendance Summary', 14, finalY + 10);
      const attendanceBody = Object.entries(attendanceSummary || {}).map(([name, data]) => [name, data.daysPresent]);
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Policeman', 'Days Present']],
        body: attendanceBody.length > 0 ? attendanceBody : [['N/A', '0']],
      });

      // Save PDF
      doc.save(`Police_Dashboard_Summary_${selectedYear}_${selectedMonth}_${loggedInCity}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setError('Failed to generate PDF report: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Monthly Police Dashboard Summary</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">Monthly Police Dashboard Summary</h1>
          </div>
          <p className="text-gray-600">View and download monthly summaries for {localStorage.getItem('loggedInCity')}.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
            <p className="mt-4 text-gray-600 text-lg">Loading data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Month and Year Selection and Download Button */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="monthSelect" className="text-gray-700 font-medium">
                    Month:
                  </label>
                  <select
                    id="monthSelect"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="yearSelect" className="text-gray-700 font-medium">
                    Year:
                  </label>
                  <input
                    id="yearSelect"
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full sm:w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    min="2000"
                    max="2100"
                  />
                </div>
              </div>
              <button
                onClick={generatePDFReport}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download PDF Report
              </button>
            </div>

            {/* Monthly Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Monthly Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Metric</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 transition duration-150">
                      <td className="py-3 px-4 text-sm text-gray-700">Total Photos Uploaded</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{monthlyData.totalPhotos || 0}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition duration-150 bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">Total Violations</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{monthlyData.totalViolations || 0}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition duration-150">
                      <td className="py-3 px-4 text-sm text-gray-700">Total Vehicle Checks</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{monthlyData.totalVehicleChecks || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Violations by Policeman */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Violations Caught by Policeman</h2>
              </div>
              {Object.keys(monthlyData.violationsByPoliceman || {}).length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Policeman</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Violations Caught</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData.violationsByPoliceman).map(([name, count], index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 text-sm text-gray-700">{name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 italic">No violations caught this month.</p>
              )}
            </div>

            {/* Vehicle Checks by Policeman */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Vehicle Checks by Policeman</h2>
              </div>
              {Object.keys(monthlyData.checksByPoliceman || {}).length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Policeman</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Vehicle Checks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData.checksByPoliceman).map(([name, count], index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 text-sm text-gray-700">{name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 italic">No vehicle checks this month.</p>
              )}
            </div>

            {/* Outdated or Illegal Items Caught by Policeman */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Problems in Documents</h2>
              </div>
              {Object.keys(monthlyData.illegalItemsByPoliceman || {}).length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Policeman</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Outdated/Illegal Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData.illegalItemsByPoliceman).map(([name, count], index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 text-sm text-gray-700">{name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 italic">No outdated or illegal items caught this month.</p>
              )}
            </div>

            {/* Most Commonly Broken Rules */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Most Commonly Broken Rules</h2>
              </div>
              {Object.keys(monthlyData.violationTypes || {}).length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Violation Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData.violationTypes).map(([rule, count], index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 text-sm text-gray-700">{rule}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 italic">No violations recorded this month.</p>
              )}
            </div>

            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Attendance Summary</h2>
              </div>
              {Object.keys(attendanceSummary).length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-indigo-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Policeman</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800">Days Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(attendanceSummary).map(([name, data], index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 text-sm text-gray-700">{name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{data.daysPresent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 italic">No attendance data available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #6366f1;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default MonthlySummary;