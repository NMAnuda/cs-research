'use client';

import { useState } from 'react';
import axios from 'axios';

export default function CheckVehicle() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [issueType, setIssueType] = useState('');
  const [punishmentSheet, setPunishmentSheet] = useState(null);
  const [city, setCity] = useState(localStorage.getItem('loggedInCity') || 'Not provided');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const issueOptions = [
    'No Issues',
    'Driving License',
    'Revenue License',
    'Insurance Certificate',
    'Vehicle Registration Certificate',
    'Emission Test Certificate',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('vehicleNumber', vehicleNumber);
    formData.append('issueType', issueType);
    if (punishmentSheet && issueType !== 'No Issues') {
      formData.append('punishmentSheet', punishmentSheet);
    }

    try {
      const response = await axios.post('http://localhost:3080/submit-vehicle-check', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-city': localStorage.getItem('loggedInCity') || 'Not provided',
          'x-policeman-id': localStorage.getItem('loggedInPolicemanId') || 'unknown', // Add policeman ID
        },
      });
      setSuccess(response.data.message);
      setVehicleNumber('');
      setIssueType('');
      setPunishmentSheet(null);
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit vehicle check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-600">Check Vehicle</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
              Vehicle Number
            </label>
            <input
              type="text"
              id="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>Select an issue</option>
              {issueOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {issueType && issueType !== 'No Issues' && (
            <div>
              <label htmlFor="punishmentSheet" className="block text-sm font-medium text-gray-700">
                Punishment Sheet
              </label>
              <input
                type="file"
                id="punishmentSheet"
                accept="application/pdf,image/*"
                onChange={(e) => setPunishmentSheet(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {punishmentSheet && <p className="text-sm text-gray-600 mt-1">Selected: {punishmentSheet.name}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={city}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {loading ? 'Checking...' : 'Check Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}