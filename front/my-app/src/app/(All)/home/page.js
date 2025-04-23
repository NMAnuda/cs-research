"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState(''); // For success/error messages
  const [city, setCity] = useState(null); // Store the city name from the response

  // Fetch current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          setLocationError(`Failed to get location: ${error.message} (Code: ${error.code})`);
        },
        { timeout: 30000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({
      file: file ? file.name : 'No file uploaded',
      vehicleNumber,
      location,
    });

    const formData = new FormData();
    formData.append('vehicleNumber', vehicleNumber);
    if (file) {
      formData.append('photo', file);
    }
    formData.append('latitude', location.latitude || '');
    formData.append('longitude', location.longitude || '');

    try {
      const response = await axios.post('http://localhost:3080/submit-checkpoint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000,
      });
      console.log('Data submitted successfully to the database');
      setSubmissionMessage('Checkpoint submitted successfully!');
      setCity(response.data.city); // Store the city name from the response
    } catch (error) {
      console.error('Error submitting data to the database:', error);
      setSubmissionMessage('Failed to submit checkpoint. Please try again.');
    }

    setFile(null);
    setVehicleNumber('');
  };

  return (
    <div className="h-full bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-lg sm:max-w-xl md:max-w-2xl">
        <h1 className="text-xl font-bold text-center text-blue-700 mb-4">
          Vehicle Checkpoint Form
        </h1>

        {submissionMessage && (
          <p className={`text-center text-sm mb-4 ${submissionMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
            {submissionMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-md p-4 bg-blue-50">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 font-medium text-sm"
            >
              {file ? file.name : "Click to capture or upload image or video"}
              <input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <p className="text-xs text-gray-500 mt-1">
                File selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="vehicle-number"
              className="block text-gray-700 font-medium text-sm mb-1"
            >
              Vehicle Number
            </label>
            <input
              id="vehicle-number"
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm"
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">
              Current Location (Optional)
            </label>
            {locationError ? (
              <p className="text-red-500 text-sm">
                {locationError}. Please ensure location services are enabled on your device.
              </p>
            ) : location.latitude && location.longitude ? (
              <div>
                <p className="text-gray-600 text-sm">
                  Latitude: {location.latitude}, Longitude: {location.longitude}
                </p>
                {city && (
                  <p className="text-gray-600 text-sm">
                    City: {city}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Unable to fetch location</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-200 text-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}