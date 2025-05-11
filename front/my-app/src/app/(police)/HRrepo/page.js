"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlySummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch summary data
  const fetchSummary = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3080/attendance-summary', {
        params: { 
          month: selectedMonth, 
          year: selectedYear,
          city: loggedInCity
        },
      });

      const { checkpoints: rawCheckpoints, attendanceSummary: rawAttendanceSummary } = response.data;

      // Validate response data
      if (!Array.isArray(rawCheckpoints)) {
        console.error('Checkpoints is not an array:', rawCheckpoints);
        throw new Error('Invalid checkpoints data received from server');
      }
      if (!Array.isArray(rawAttendanceSummary)) {
        console.error('Attendance summary is not an array:', rawAttendanceSummary);
        throw new Error('Invalid attendance summary data received from server');
      }

      // Process checkpoints
      const processedCheckpoints = rawCheckpoints.map(item => ({
        ...item,
        date: new Date(item.createdAt).toISOString().slice(0, 10),
      }));
      setCheckpoints(processedCheckpoints);

      // Process attendance summary
      const processedAttendanceSummary = rawAttendanceSummary.map(item => ({
        ...item,
        date: new Date(item.date).toISOString().slice(0, 10),
      }));
      setAttendanceSummary(processedAttendanceSummary);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch summary data');
      setCheckpoints([]);
      setAttendanceSummary([]);
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

      // Checkpoint Summary
      doc.setFontSize(14);
      doc.text("Checkpoint Summary", 14, 30);
      const checkpointBody = checkpoints.map(item => [
        item.vehicleNumber || "N/A",
        item.city || "N/A",
        item.date || "N/A",
        item.actionTaken || "Pending",
        item.photoPath || "No Image",
      ]);
      autoTable(doc, {
        startY: 35,
        head: [["Vehicle Number", "City", "Date", "Action Taken", "Image Path"]],
        body: checkpointBody,
      });

      // Attendance Summary
      const finalYCheckpoints = doc.lastAutoTable?.finalY || 35;
      doc.setFontSize(14);
      doc.text("Attendance Summary", 14, finalYCheckpoints + 10);
      const attendanceBody = attendanceSummary.map(item => [
        item.name || "N/A",
        item.city || "N/A",
        item.date || "N/A",
      ]);
      autoTable(doc, {
        startY: finalYCheckpoints + 15,
        head: [["Name", "City", "Date"]],
        body: attendanceBody,
      });

      // Save PDF
      doc.save(`Police_Dashboard_Summary_${selectedYear}_${selectedMonth}_${loggedInCity}.pdf`);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      setError("Failed to generate PDF report: " + error.message);
    }
  };

  // Process attendance data for the bar chart
  const attendanceChartData = () => {
    const attendanceByName = attendanceSummary.reduce((acc, item) => {
      const name = item.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1; // Count each day as 1
      return acc;
    }, {});

    const labels = Object.keys(attendanceByName);
    const data = Object.values(attendanceByName);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Days Present',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue bars
          borderColor: 'rgba(54, 162, 235, 1)', // Slightly darker blue border
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#000000', // Black text for legend
        },
      },
      title: {
        display: true,
        text: `Attendance for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`,
        color: '#000000', // Black text for title
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000', // Black text for x-axis
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Light grid lines
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000', // Black text for y-axis
          stepSize: 1, // Whole numbers for days
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Light grid lines
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <Head>
        <title>Monthly Police Dashboard Summary</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-black">
          <h1 className="text-3xl font-bold text-black text-center">Monthly Police Dashboard Summary</h1>
          <p className="text-black text-center mt-2">View and download monthly checkpoint and attendance summaries.</p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full text-center border border-black">
            <p className="text-black text-lg">Loading data...</p>
          </div>
        )}
        {error && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full text-center border border-black">
            <p className="text-red-600 text-lg">Error: {error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="space-y-8">
            {/* Month and Year Selection and Download Button */}
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-black">
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
              <button
                onClick={generatePDFReport}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download PDF Report
              </button>
            </div>

            {/* Attendance Data Table */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-black">
              <h2 className="text-xl font-semibold text-black mb-4">Attendance Data</h2>
              {attendanceSummary.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scroll">
                  <table className="min-w-full divide-y divide-black">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-black">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-black">City</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-black">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {attendanceSummary.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition duration-150">
                          <td className="py-3 px-4 text-sm text-black">{item.name}</td>
                          <td className="py-3 px-4 text-sm text-black">{item.city}</td>
                          <td className="py-3 px-4 text-sm text-black">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-black text-sm">No attendance data available.</p>
              )}
            </div>

            {/* Attendance Bar Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-black">
              <h2 className="text-xl font-semibold text-black mb-4">Attendance Overview</h2>
              {attendanceSummary.length > 0 ? (
                <div className="w-full h-80">
                  <Bar
                    data={attendanceChartData()}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-center text-black text-sm">No attendance data available for charting.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #a0aec0;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #edf2f7;
        }
      `}</style>
    </div>
  );
};

export default MonthlySummary;