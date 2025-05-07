const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios'); 
const Twilio = require('twilio');
const { users, Pdetails, Atten } = require('../models/Pdashmodouls');

require('dotenv').config(); 

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio credentials are missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
}

const client = (accountSid && authToken) ? Twilio(accountSid, authToken) : null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.get('/notify', async (request, res) => {
  try {
    console.log("fetched");
    res.status(200).json({ message: "Fetched successfully" });
  } catch (error) {
    console.log(error, "fetching error");
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post('/submit-checkpoint', upload.single('photo'), async (req, res) => {
  try {
    const { vehicleNumber, latitude, longitude } = req.body;
    const photoPath = req.file ? req.file.path : null;

    if (!vehicleNumber) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

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
        city = components.city || components.town || components.village || 'Unknown';
      } else {
        city = 'Unknown';
      }
    } else {
      city = 'Not provided';
    }

    const newCheckpoint = {
      vehicleNumber,
      photoPath,
      latitude: latitude || null,
      longitude: longitude || null,
      city: city,
      createdAt: new Date(),
      actionTaken: 'Pending', // Initialize actionTaken as Pending
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendanceRecords = await Atten.find({
      Attendace: true,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (attendanceRecords.length === 0) {
      console.log(`No policemen with Attendace: true found for today`);
    } else {
      console.log(`Found ${attendanceRecords.length} policemen with Attendace: true for today`);
    }

    const pdetailsRecords = await Pdetails.find();

    const policemenToNotify = attendanceRecords.map(attendance => {
      const pdetail = pdetailsRecords.find(p => p.ID === attendance.ID);
      return {
        phoneno: pdetail ? pdetail.phoneno : null,
        ID: attendance.ID,
      };
    }).filter(p => p.phoneno);

    if (policemenToNotify.length > 0) {
      console.log(`Notifying ${policemenToNotify.length} policemen`);

      if (!client) {
        console.error('Twilio client not initialized due to missing credentials. Skipping SMS sending.');
      } else {
        for (const policeman of policemenToNotify) {
          try {
            let phoneno = policeman.phoneno.toString().replace(/[-\s]/g, ''); 
            if (!phoneno.startsWith('+')) {
              phoneno = `+94${phoneno}`;
            }

            if (!phoneno.match(/^\+\d{10,15}$/)) {
              console.log(`Invalid phone number: ${phoneno} (must be 10-15 digits after country code)`);
              continue;
            }

            const safeVehicleNumber = vehicleNumber || 'UnknownVehicle';
            const safeCity = city || 'UnknownCity';
            const body = `Checkpoint submitted for vehicle ${safeVehicleNumber} in ${safeCity}.`;

            if (body.length > 320) {
              console.warn(`SMS message exceeds recommended length of 320 characters (${body.length} characters). Consider shortening for better deliverability.`);
            }

            console.log(`Preparing SMS: vehicleNumber=${safeVehicleNumber}, city=${safeCity}`);
            console.log(`Sending SMS with body: ${body}`);

            await client.messages.create({
              body: body,
              from: twilioPhoneNumber,
              to: phoneno,
            });
            console.log(`SMS sent to ${phoneno}`);
          } catch (smsError) {
            console.error(`Failed to send SMS to ${policeman.phoneno}:`, smsError.message);
          }
        }
      }
    } else {
      console.log(`No matching phone numbers found for policemen`);
    }

    await users.create(newCheckpoint);

    res.status(200).json({ message: 'Checkpoint data submitted successfully', city: city });
  } catch (error) {
    console.error('Error submitting checkpoint data:', error);
    res.status(500).json({ error: 'Failed to submit checkpoint data' });
  }
});

router.post('/submit-pdetails', async (req, res) => {
  try {
    const { phoneno, name, location, city, ID } = req.body;
    console.log("call backend", phoneno, name, location, city);
    if (!phoneno) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const newPdetails = {
      phoneno,
      name,
      city,
      ID,
    };

    await Pdetails.create(newPdetails);

    res.status(200).json({ message: 'Pdetails data submitted successfully' });
  } catch (error) {
    console.error('Error submitting Pdetails data:', error);
    res.status(500).json({ error: 'Failed to submit Pdetails data' });
  }
});

router.get('/attendance-records', async (req, res) => {
  try {
    console.log("Fetching attendance records...");
    const records = await Pdetails.find({});
    
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

router.put('/update-attendance', async (req, res) => {
  try {
    console.log("Submitting attendance records:");
    const attendanceRecords = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ error: 'Attendance records must be a non-empty array' });
    }

    const newRecords = attendanceRecords.map(record => {
      if (!record.ID || record.ID <= 0) {
        throw new Error('Valid ID is required for all records');
      }
      if (!record.city) {
        throw new Error('City is required for all records');
      }
      return {
        ID: record.ID,
        city: record.city,
        Attendace: record.Attendace || false,
        date: new Date(),
      };
    });

    await Atten.insertMany(newRecords);

    res.status(200).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error.message);
    res.status(500).json({ error: 'Failed to submit attendance' });
  }
});

router.get('/checkpoints', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const checkpoints = await users.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json(checkpoints);
  } catch (error) {
    console.error('Error fetching checkpoints:', error);
    res.status(500).json({ error: 'Failed to fetch checkpoints' });
  }
});

router.get('/attendance-today', async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const attendanceRecords = await Atten.find({
      date: {
        $gte: new Date(start),
        $lt: new Date(end),
      },
    });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records for today:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

router.put('/update-pdetails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneno, name, city, ID } = req.body;

    if (!phoneno || !name || !city || !ID) {
      return res.status(400).json({ error: 'All fields (phoneno, name, city, ID) are required' });
    }

    const updatedOfficer = await Pdetails.findByIdAndUpdate(
      id,
      { phoneno, name, city, ID },
      { new: true }
    );

    if (!updatedOfficer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    res.status(200).json({ message: 'Officer updated successfully', officer: updatedOfficer });
  } catch (error) {
    console.error('Error updating officer:', error);
    res.status(500).json({ error: 'Failed to update officer' });
  }
});

router.delete('/delete-pdetails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOfficer = await Pdetails.findByIdAndDelete(id);

    if (!deletedOfficer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    res.status(200).json({ message: 'Officer deleted successfully' });
  } catch (error) {
    console.error('Error deleting officer:', error);
    res.status(500).json({ error: 'Failed to delete officer' });
  }
});

router.get('/policeman-checkpoints', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Fetch all checkpoints for policemen present today (no city filtering)
    const attendanceRecords = await Atten.find({
      Attendace: true,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (attendanceRecords.length === 0) {
      return res.status(200).json([]); // No active policemen
    }

    const checkpoints = await users.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json(checkpoints);
  } catch (error) {
    console.error('Error fetching checkpoints for policeman:', error);
    res.status(500).json({ error: 'Failed to fetch checkpoints' });
  }
});

router.put('/update-checkpoint-action-taken/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { actionTaken } = req.body;

    if (!['Action Taken', 'No Action Taken'].includes(actionTaken)) {
      return res.status(400).json({ error: 'Invalid action. Must be "Action Taken" or "No Action Taken"' });
    }

    const updatedCheckpoint = await users.findByIdAndUpdate(
      id,
      { actionTaken },
      { new: true }
    );

    if (!updatedCheckpoint) {
      return res.status(404).json({ error: 'Checkpoint not found' });
    }

    res.status(200).json({ message: 'Action updated successfully', checkpoint: updatedCheckpoint });
  } catch (error) {
    console.error('Error updating checkpoint action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

module.exports = router;