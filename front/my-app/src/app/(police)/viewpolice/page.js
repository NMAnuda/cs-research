'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OfficersView() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOfficer, setEditOfficer] = useState(null);
  const [formData, setFormData] = useState({ phoneno: '', name: '', city: '', ID: '' });
  const [message, setMessage] = useState('');

  const fetchOfficers = async () => {
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:3080/attendance-records', {
        params: { city: loggedInCity },
      });
      setOfficers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching officers:', error);
      setError('Failed to fetch officers');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleEditClick = (officer) => {
    setEditOfficer(officer);
    setFormData({
      phoneno: officer.phoneno,
      name: officer.name,
      city: officer.city,
      ID: officer.ID,
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const loggedInCity = localStorage.getItem('loggedInCity');
    if (!loggedInCity) {
      setError('No city selected. Please log in again.');
      return;
    }
    if (formData.city !== loggedInCity) {
      setError('You can only update officers for your logged-in city.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3080/update-pdetails/${editOfficer._id}`, formData);
      setMessage(response.data.message);
      setOfficers(officers.map(o => (o._id === editOfficer._id ? response.data.officer : o)));
      setEditOfficer(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update officer');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this officer?')) {
      try {
        const officerToDelete = officers.find(o => o._id === id);
        const loggedInCity = localStorage.getItem('loggedInCity');
        if (!loggedInCity) {
          setError('No city selected. Please log in again.');
          return;
        }
        if (officerToDelete.city !== loggedInCity) {
          setError('You can only delete officers from your logged-in city.');
          return;
        }
        const response = await axios.delete(`http://localhost:3080/delete-pdetails/${id}`);
        setMessage(response.data.message);
        setOfficers(officers.filter(o => o._id !== id));
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete officer');
      }
    }
  };

  const handleAddNewOfficer = () => {
    window.location.href = '/Pdetails'; 
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Officers View</h1>
      {message && <p className="mb-4 text-green-600 text-center">{message}</p>}
      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

      {/* Officers Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-black text-center">Loading...</p>
        ) : officers.length > 0 ? (
          <table className="min-w-full border border-black">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-black text-black">Name</th>
                <th className="py-2 px-4 border-b border-black text-black">ID</th>
                <th className="py-2 px-4 border-b border-black text-black">Phone Number</th>
                <th className="py-2 px-4 border-b border-black text-black">City</th>
                <th className="py-2 px-4 border-b border-black text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-black text-black">{officer.name}</td>
                  <td className="py-2 px-4 border-b border-black text-black">{officer.ID}</td>
                  <td className="py-2 px-4 border-b border-black text-black">{officer.phoneno}</td>
                  <td className="py-2 px-4 border-b border-black text-black">{officer.city}</td>
                  <td className="py-2 px-4 border-b border-black text-black">
                    <button
                      onClick={() => handleEditClick(officer)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(officer._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-black text-center">No officers found</p>
        )}
      </div>

      {/* Add New Officer Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleAddNewOfficer}
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
        >
          Add New Officer
        </button>
      </div>

      {/* Edit Modal */}
      {editOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Edit Officer</h2>
            <div>
              <div className="mb-4">
                <label className="block text-black mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full border border-black p-2 rounded text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-1">ID</label>
                <input
                  type="number"
                  name="ID"
                  value={formData.ID}
                  onChange={handleFormChange}
                  className="w-full border border-black p-2 rounded text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneno"
                  value={formData.phoneno}
                  onChange={handleFormChange}
                  className="w-full border border-black p-2 rounded text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className="w-full border border-black p-2 rounded text-black bg-gray-100 cursor-not-allowed"
                  readOnly // Make city read-only
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditOfficer(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}