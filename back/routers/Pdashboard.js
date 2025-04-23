const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios'); // Add axios for geocoding
const { users } = require('../models/Pdashmodouls');
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Existing /notify route
router.get('/notify', async (request, res) => {
  try {
    console.log("fetched");
    res.status(200).json({ message: "Fetched successfully" });
  } catch (error) {
    console.log(error, "fetching error");
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Updated /submit-checkpoint route to fetch and store city name
router.post('/submit-checkpoint', upload.single('photo'), async (req, res) => {
  try {
    const { vehicleNumber, latitude, longitude } = req.body;
    const photoPath = req.file ? req.file.path : null;

    if (!vehicleNumber) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

    // Fetch the city name using OpenCage if latitude and longitude are provided
    let city = null;
    if (latitude && longitude) {
      const apiKey = process.env.OPENCAGE_API_KEY;
      if (!apiKey) {
        throw new Error('OPENCAGE_API_KEY is not defined in environment variables');
      }

      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=en&pretty=1`;
      const response = await axios.get(url);
      const results = response.data.results;

      if (results && results.length > 0) {
        const components = results[0].components;
        // OpenCage returns various address components; 'city' or 'town' is typically the field for cities
        city = components.city || components.town || components.village || 'Unknown';
      } else {
        city = 'Unknown';
      }
    } else {
      city = 'Not provided';
    }

    // Create the new checkpoint with the city name
    const newCheckpoint = {
      vehicleNumber,
      photoPath,
      latitude: latitude || null,
      longitude: longitude || null,
      city: city, // Add the city to the document
      createdAt: new Date(),
    };

    await users.create(newCheckpoint);

    res.status(200).json({ message: 'Checkpoint data submitted successfully', city: city });
  } catch (error) {
    console.error('Error submitting checkpoint data:', error);
    res.status(500).json({ error: 'Failed to submit checkpoint data' });
  }
});

module.exports = router;