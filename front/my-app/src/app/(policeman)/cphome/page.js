'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PolicemanGeneralView() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCheckpoints = async () => {
    try {
      const loggedInCity = localStorage.getItem('loggedInCity');
      if (!loggedInCity) {
        setError('No city selected. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:3080/policeman-checkpoints', {
        params: { city: loggedInCity },
      });
      console.log('Fetched Checkpoints:', response.data); // Debug: Log the fetched checkpoints
      setCheckpoints(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      setError(error.response?.data?.error || 'Failed to fetch checkpoints');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const handleAction = async (checkpointId, actionTaken) => {
    try {
      const response = await axios.put(`http://localhost:3080/update-checkpoint-action-taken/${checkpointId}`, { actionTaken });
      setMessage(response.data.message);
      setCheckpoints(checkpoints.map(c => (c._id === checkpointId ? response.data.checkpoint : c)));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update action');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Policeman General View</h1>
      {message && <p className="mb-4 text-green-600 text-center">{message}</p>}
      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

      <div className="space-y-4">
        {loading ? (
          <p className="text-black text-center">Loading...</p>
        ) : checkpoints.length > 0 ? (
          checkpoints.map((checkpoint) => {
            // Debug: Log the actionTaken value for each checkpoint
            console.log(`Checkpoint ${checkpoint.vehicleNumber} - actionTaken: ${checkpoint.actionTaken}`);
            // Normalize actionTaken to handle undefined or null values
            const actionTaken = checkpoint.actionTaken || 'Pending';

            return (
              <div key={checkpoint._id} className="border border-black rounded-md p-4">
                <div className="mb-2">
                  <p className="text-black"><strong>Vehicle Number:</strong> {checkpoint.vehicleNumber}</p>
                  <p className="text-black"><strong>City:</strong> {checkpoint.city}</p>
                  <p className="text-black"><strong>Time:</strong> {new Date(checkpoint.createdAt).toLocaleString()}</p>
                  <p className="text-black"><strong>Status:</strong> {actionTaken}</p>
                </div>
                {checkpoint.photoPath ? (
                  <img
                    src={`http://localhost:3080/${checkpoint.photoPath}`}
                    alt="Checkpoint Vehicle"
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                ) : (
                  <p className="text-black">No image available</p>
                )}
                {actionTaken === 'Pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(checkpoint._id, 'Action Taken')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Get Action
                    </button>
                    <button
                      onClick={() => handleAction(checkpoint._id, 'No Action Taken')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Not
                    </button>
                  </div>
                ) : (
                  <p className="text-black">Action: {actionTaken}</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-black text-center">No checkpoints found for today</p>
        )}
      </div>
    </div>
  );
}