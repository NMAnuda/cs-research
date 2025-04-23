"use client";

import { useState, useEffect } from 'react';
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRequest = async () => {
    try {
      console.log("hi hi");
      const response = await axios.get("http://localhost:3080/notify");
      console.log("Data fetched successfully");
      const responseData = response.data.requests || response.data;
      setData(Array.isArray(responseData) ? responseData : [responseData]);
      setLoading(false);
    } catch (error) {
      console.error("Data retrieving error:", error);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="h-full bg-white flex p-4 gap-4">
      {/* Left Section: Today */}
      <div className="w-2/3 bg-gray-100 border border-gray-300 rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Today</h2>
        <div className="h-96">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <p key={index}>{JSON.stringify(item)}</p> // Adjust rendering based on your data structure
            ))
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>

      {/* Right Section: Today Past actions and Trakings */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Today Past actions */}
        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Today Past actions</h2>
          <div className="h-48">
            <p>Scrollable content goes here...</p>
            {Array(10)
              .fill()
              .map((_, index) => (
                <p key={index}>Action {index + 1}</p>
              ))}
          </div>
        </div>

        {/* Trakings */}
        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Trakings</h2>
          <div className="h-48">
            <p>Scrollable content goes here...</p>
            {Array(10)
              .fill()
              .map((_, index) => (
                <p key={index}>Tracking {index + 1}</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}