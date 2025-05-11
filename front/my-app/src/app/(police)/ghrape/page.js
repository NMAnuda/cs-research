'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

export default function GraphicalView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [prevMonthlyData, setPrevMonthlyData] = useState({});
  const [allMonthsData, setAllMonthsData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loggedInCity, setLoggedInCity] = useState('');
  const [activeTab, setActiveTab] = useState('dailyCatches'); // Changed default tab to dailyCatches

  // Fetch monthly summary data
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const city = localStorage.getItem('loggedInCity');
      if (!city) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }
      setLoggedInCity(city);

      if (selectedMonth === 0) {
        const promises = Array.from({ length: 12 }, (_, i) => {
          return axios.get('http://localhost:3080/monthly-summary', {
            params: { month: i + 1, year: selectedYear, city: city },
          });
        });
        const responses = await Promise.all(promises);
        const allData = responses.map((response, index) => ({
          month: index + 1,
          checkpoints: response.data.checkpoints,
          attendanceSummary: response.data.attendanceSummary,
        }));
        setAllMonthsData(allData);
        setMonthlyData({});
        setPrevMonthlyData({});
        setAttendanceSummary({});
      } else {
        const response = await axios.get('http://localhost:3080/monthly-summary', {
          params: { month: selectedMonth, year: selectedYear, city: city },
        });
        const { checkpoints, attendanceSummary } = response.data;
        setMonthlyData(checkpoints);
        setAttendanceSummary(attendanceSummary);

        const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
        const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        const prevResponse = await axios.get('http://localhost:3080/monthly-summary', {
          params: { month: prevMonth, year: prevYear, city: city },
        });
        setPrevMonthlyData(prevResponse.data.checkpoints);
        setAllMonthsData([]);
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setError(error.response?.data?.error || error.message);
      setMonthlyData({});
      setPrevMonthlyData({});
      setAllMonthsData([]);
      setAttendanceSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  const dailyCatchesChartData = () => {
    return {
      labels: ['Total Breaches'],
      datasets: [{
        label: 'Number of Rule Breaches',
        data: [monthlyData.totalViolations || 0],
        backgroundColor: 'rgba(75, 192, 192, 0.8)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };
  };

  const mostBrokenRulesChartData = () => {
    return {
      labels: Object.keys(monthlyData.violationTypes || {}),
      datasets: [{
        label: 'Violation Types',
        data: Object.values(monthlyData.violationTypes || {}),
        backgroundColor: [
          'rgba(153, 102, 255, 0.8)', 
          'rgba(128, 0, 128, 0.8)',
          'rgba(200, 150, 255, 0.8)',
          'rgba(150, 100, 200, 0.8)',
          'rgba(100, 50, 150, 0.8)',
        ],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      }],
    };
  };

  const caughtVehiclesChartData = () => {
    return {
      labels: Object.keys(monthlyData.violationsByPoliceman || {}),
      datasets: [{
        label: 'Number of Caught Vehicles',
        data: Object.values(monthlyData.violationsByPoliceman || {}),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }],
    };
  };

  const vehicleChecksChartData = () => {
    return {
      labels: Object.keys(monthlyData.checksByPoliceman || {}),
      datasets: [{
        label: 'Number of Vehicle Checks',
        data: Object.values(monthlyData.checksByPoliceman || {}),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }],
    };
  };

  const violationTrendsChartData = () => {
    const categories = [
      'Cross Road Line',
      'High Speed',
      'No Parking',
      'Red Light Violation',
      'Driving License',
      'Revenue License',
      'Insurance Certificate',
      'Vehicle Registration Certificate',
      'Emission Test Certificate',
    ];

    const colors = [
      'rgba(0, 128, 128, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(0, 255, 127, 0.8)',
      'rgba(199, 21, 133, 0.8)',
    ];

    if (selectedMonth === 0) {
      const months = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('default', { month: 'short' })
      );

      const datasets = categories.map((category, index) => {
        const data = allMonthsData.map(monthData => {
          const checkpoints = monthData.checkpoints || {};
          return category in (checkpoints.violationTypes || {})
            ? checkpoints.violationTypes[category] || 0
            : (checkpoints.illegalItemsBreakdown || {})[category] || 0;
        });

        return {
          label: category,
          data: data,
          fill: false,
          borderColor: colors[index],
          backgroundColor: colors[index],
          pointBackgroundColor: colors[index],
          pointBorderColor: colors[index],
          pointBorderWidth: 1,
          tension: 0.1,
        };
      });

      return {
        labels: months,
        datasets: datasets,
      };
    } else {
      const months = [];
      const currentMonthName = new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'short' });
      const prevMonthName = new Date(0, selectedMonth === 1 ? 11 : selectedMonth - 2).toLocaleString('default', { month: 'short' });
      months.push(prevMonthName);
      months.push(currentMonthName);

      const datasets = categories.map((category, index) => {
        const prevCount = category in (prevMonthlyData.violationTypes || {})
          ? prevMonthlyData.violationTypes[category] || 0
          : (prevMonthlyData.illegalItemsBreakdown || {})[category] || 0;
        const currentCount = category in (monthlyData.violationTypes || {})
          ? monthlyData.violationTypes[category] || 0
          : (monthlyData.illegalItemsBreakdown || {})[category] || 0;

        return {
          label: category,
          data: [prevCount, currentCount],
          fill: false,
          borderColor: colors[index],
          backgroundColor: colors[index],
          pointBackgroundColor: colors[index],
          pointBorderColor: colors[index],
          pointBorderWidth: 1,
          tension: 0.1,
        };
      });

      return {
        labels: months,
        datasets: datasets,
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#000000' } },
      title: { display: true, color: '#000000' },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000',
          maxRotation: selectedMonth === 0 ? 45 : 0,
          minRotation: selectedMonth === 0 ? 45 : 0,
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
      y: { beginAtZero: true, ticks: { color: '#000000', stepSize: 1 }, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <Head>
        <title>GraphicalView - Police Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-black">
          <h1 className="text-3xl font-bold text-black text-center">Graphical View - Police Dashboard</h1>
          <p className="text-black text-center mt-2">Visual representation for {loggedInCity}.</p>
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

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-4 bg-white shadow-lg rounded-lg p-4 border border-black">
              <button
                onClick={() => setActiveTab('dailyCatches')}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium ${activeTab === 'dailyCatches' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                Monthly Catches Breaking Rules
              </button>
              <button
                onClick={() => setActiveTab('mostBroken')}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium ${activeTab === 'mostBroken' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                Most Commonly Broken Rules
              </button>
              <button
                onClick={() => setActiveTab('caughtVehicles')}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium ${activeTab === 'caughtVehicles' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                Caught Vehicles Breaking Rules
              </button>
              <button
                onClick={() => setActiveTab('vehicleChecks')}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium ${activeTab === 'vehicleChecks' ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                Monthly Vehicle Checks
              </button>
              <button
                onClick={() => setActiveTab('violationTrends')}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium ${activeTab === 'violationTrends' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-black'}`}
              >
                Violation Trends
              </button>
            </div>

            {/* Graph Content */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-black">
              {activeTab === 'dailyCatches' && (
                <div className="w-full h-96">
                  <h2 className="text-xl font-semibold text-black mb-4">Monthly Catches Breaking Rules</h2>
                  <Bar data={dailyCatchesChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Total Breaches for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` } } }} />
                </div>
              )}
              {activeTab === 'mostBroken' && (
                <div className="w-full h-96">
                  <h2 className="text-xl font-semibold text-black mb-4">Most Commonly Broken Rules</h2>
                  <Pie data={mostBrokenRulesChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Rule Breaches for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` } } }} />
                </div>
              )}
              {activeTab === 'caughtVehicles' && (
                <div className="w-full h-96">
                  <h2 className="text-xl font-semibold text-black mb-4">Caught Vehicles Breaking Rules</h2>
                  <Bar data={caughtVehiclesChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Caught Vehicles for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` } } }} />
                </div>
              )}
              {activeTab === 'vehicleChecks' && (
                <div className="w-full h-96">
                  <h2 className="text-xl font-semibold text-black mb-4">Monthly Vehicle Checks</h2>
                  <Bar data={vehicleChecksChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Vehicle Checks for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` } } }} />
                </div>
              )}
              {activeTab === 'violationTrends' && (
                <div className="w-full h-96">
                  <h2 className="text-xl font-semibold text-black mb-4">Violation Trends</h2>
                  <Line data={violationTrendsChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Violation Trends for ${selectedYear}` } } }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}