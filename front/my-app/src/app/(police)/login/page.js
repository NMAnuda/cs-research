'use client';

import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Login() {
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3080/login', {
        district,
        city,
      });
      if (response.data.success) {
        // Store the city in localStorage
        localStorage.setItem('loggedInCity', response.data.city);
        alert('Login successful!');
        // Redirect to dashboard
        window.location.href = '/Phome'; // Adjust the route as needed
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Head>
        <title>Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="w-full max-w-md bg-white border border-black rounded-md p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-black text-center mb-6">Login</h1>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="district" className="block text-black text-sm font-medium mb-1">
              District
            </label>
            <input
              type="text"
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2 border border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-black text-sm font-medium mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 border border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}