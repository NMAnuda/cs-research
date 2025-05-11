const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const Twilio = require('twilio');
const { users, Pdetails, Atten, uploads } = require('../models/Pdashmodouls');

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
      actionTaken: 'Pending',
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

    // Filter policemen to notify based on matching city with the checkpoint
    const policemenToNotify = attendanceRecords
      .map(attendance => {
        const pdetail = pdetailsRecords.find(p => p.ID === attendance.ID);
        return {
          phoneno: pdetail ? pdetail.phoneno : null,
          ID: attendance.ID,
          city: pdetail ? pdetail.city : null,
        };
      })
      .filter(p => p.phoneno && p.city === city); // Only notify if city matches

    if (policemenToNotify.length > 0) {
      console.log(`Notifying ${policemenToNotify.length} related policemen in ${city}`);

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
      console.log(`No related policemen with Attendace: true found in ${city}`);
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

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
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
    const { city } = req.query; // Get city from client
    console.log(`Fetching attendance records for city: ${city}...`);
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const records = await Pdetails.find({ city }); // Filter by city
    
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
    const { city } = req.query; // Get city from client
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const query = {
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
      city: city, // Filter by city
    };

    const checkpoints = await users.find(query);

    res.status(200).json(checkpoints);
  } catch (error) {
    console.error('Error fetching checkpoints:', error);
    res.status(500).json({ error: 'Failed to fetch checkpoints' });
  }
});

router.get('/attendance-today', async (req, res) => {
  try {
    const { start, end, city } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const query = {
      date: {
        $gte: new Date(start),
        $lt: new Date(end),
      },
      city: city, // Filter by city
    };

    const attendanceRecords = await Atten.find(query);

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
    const { city } = req.query; 
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

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
      city: city, 
    });

    if (attendanceRecords.length === 0) {
      return res.status(200).json([]); 
    }

    const query = {
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
      city: city, 
    };

    const checkpoints = await users.find(query);

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

router.get('/monthly-summary', async (req, res) => {
  try {
    const { month, year, city } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const checkpoints = await uploads.find({
      createdAt: { $gte: startDate, $lte: endDate },
      city: city,
    });

    const attendanceRecords = await Atten.find({
      date: { $gte: startDate, $lte: endDate },
      city: city,
    });

    const pdetails = await Pdetails.find({ city });

    const attendanceSummary = attendanceRecords
      .filter(record => record.Attendace)
      .reduce((acc, record) => {
        const pdetail = pdetails.find(p => p.ID === record.ID);
        const name = pdetail ? pdetail.name : 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

    // Process monthly checkpoint data
    const monthlyData = {
      totalPhotos: checkpoints.filter(c => c.photoPath).length,
      totalViolations: checkpoints.filter(c => c.violationType).length,
      totalVehicleChecks: checkpoints.filter(c => c.issueType).length,
      violationTypes: checkpoints.reduce((acc, c) => {
        const rule = c.violationType || 'No Violation';
        acc[rule] = (acc[rule] || 0) + 1;
        return acc;
      }, {}),
      photosByPoliceman: checkpoints.reduce((acc, c) => {
        const pdetail = pdetails.find(p => p.ID === c.policemanId);
        const name = pdetail ? pdetail.name : 'Unknown';
        acc[name] = (acc[name] || 0) + (c.photoPath ? 1 : 0);
        return acc;
      }, {}),
      violationsByPoliceman: checkpoints.reduce((acc, c) => {
        if (c.violationType) {
          const pdetail = pdetails.find(p => p.ID === c.policemanId);
          const name = pdetail ? pdetail.name : 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      }, {}),
      checksByPoliceman: checkpoints.reduce((acc, c) => {
        if (c.issueType) {
          const pdetail = pdetails.find(p => p.ID === c.policemanId);
          const name = pdetail ? pdetail.name : 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      }, {}),
      illegalItemsByPoliceman: checkpoints.reduce((acc, c) => {
        if (c.issueType && c.issueType !== 'No Issues') {
          const pdetail = pdetails.find(p => p.ID === c.policemanId);
          const name = pdetail ? pdetail.name : 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      }, {}),
      illegalItemsBreakdown: checkpoints.reduce((acc, c) => {
        if (c.issueType && c.issueType !== 'No Issues') {
          acc[c.issueType] = (acc[c.issueType] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    res.status(200).json({
      checkpoints: monthlyData,
      attendanceSummary: Object.fromEntries(Object.entries(attendanceSummary).map(([name, count]) => [name, { daysPresent: count }])),
    });
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    res.status(500).json({ error: 'Failed to generate monthly summary' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { district, city } = req.body;

    console.log("Login request:", district, city);
    if (!district || !city) {
      return res.status(400).json({ success: false, message: 'District and city are required' });
    }

    // Simple validation (replace with your authentication logic)
    // const validDistricts = ['Colombo', 'Ampāra', 'Malabe']; // Example districts
    // if (!validDistricts.includes(district)) {
    //   return res.status(401).json({ success: false, message: 'Invalid district' });
    // }

    return res.status(200).json({ success: true, message: 'Login successful', city });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/submit-violation', upload.single('photo'), async (req, res) => {
  console.log("Submitting violation data:", req.body);
  try {
    const { vehicleNumber, violationType } = req.body;
    const photoPath = req.file ? req.file.path : null;
    const city = req.headers['x-city'] || 'Not provided';
    const policemanId = req.headers['x-policeman-id'] || 'unknown'; 

    if (!vehicleNumber || !violationType || !photoPath) {
      return res.status(400).json({ error: 'Vehicle number, violation type, and photo are required' });
    }

    const newCheckpoint = {
      vehicleNumber,
      photoPath,
      city,
      violationType,
      policemanId: parseInt(policemanId), 
      createdAt: new Date(),
      actionTaken: 'Pending',
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendanceRecords = await Atten.find({
      Attendace: true,
      date: { $gte: today, $lt: tomorrow },
    });

    if (attendanceRecords.length === 0) {
      console.log(`No policemen with Attendace: true found for today`);
    } else {
      console.log(`Found ${attendanceRecords.length} policemen with Attendace: true for today`);
    }

    const pdetailsRecords = await Pdetails.find();

    const policemenToNotify = attendanceRecords
      .map(attendance => {
        const pdetail = pdetailsRecords.find(p => p.ID === attendance.ID);
        return {
          phoneno: pdetail ? pdetail.phoneno : null,
          ID: attendance.ID,
          city: pdetail ? pdetail.city : null,
        };
      })
      .filter(p => p.phoneno && p.city === city);

    if (policemenToNotify.length > 0) {
      console.log(`Notifying ${policemenToNotify.length} related policemen in ${city}`);

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
            const body = `Traffic violation submitted for vehicle ${safeVehicleNumber} in ${safeCity}. Violation: ${violationType}.`;

            if (body.length > 320) {
              console.warn(`SMS message exceeds recommended length of 320 characters (${body.length} characters). Consider shortening for better deliverability.`);
            }

            console.log(`Preparing SMS: vehicleNumber=${safeVehicleNumber}, city=${safeCity}, violation=${violationType}`);
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
      console.log(`No related policemen with Attendace: true found in ${city}`);
    }

    await uploads.create(newCheckpoint);

    res.status(200).json({ message: 'Violation submitted successfully', city: city });
  } catch (error) {
    console.error('Error submitting violation:', error);
    res.status(500).json({ error: 'Failed to submit violation' });
  }
});

router.post('/submit-vehicle-check', upload.fields([{ name: 'punishmentSheet', maxCount: 1 }]), async (req, res) => {
  try {
    const { vehicleNumber, issueType } = req.body;
    const city = req.headers['x-city'] || 'Not provided';
    const policemanId = req.headers['x-policeman-id'] || 'unknown';
    const punishmentSheetPath = req.files?.punishmentSheet?.[0]?.path || null;

    if (!vehicleNumber || !issueType) {
      return res.status(400).json({ error: 'Vehicle number and issue type are required' });
    }

    const newVehicleCheck = {
      vehicleNumber,
      issueType,
      city,
      policemanId: parseInt(policemanId), 
      punishmentSheetPath,
      createdAt: new Date(),
      type: 'vehicle-check',
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendanceRecords = await Atten.find({
      Attendace: true,
      date: { $gte: today, $lt: tomorrow },
    });

    if (attendanceRecords.length === 0) {
      console.log(`No policemen with Attendace: true found for today`);
    } else {
      console.log(`Found ${attendanceRecords.length} policemen with Attendace: true for today`);
    }

    const pdetailsRecords = await Pdetails.find();

    const policemenToNotify = attendanceRecords
      .map(attendance => {
        const pdetail = pdetailsRecords.find(p => p.ID === attendance.ID);
        return {
          phoneno: pdetail ? pdetail.phoneno : null,
          ID: attendance.ID,
          city: pdetail ? pdetail.city : null,
        };
      })
      .filter(p => p.phoneno && p.city === city);

    if (policemenToNotify.length > 0) {
      console.log(`Notifying ${policemenToNotify.length} related policemen in ${city}`);

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
            const issueMessage = issueType === 'No Issues' ? 'No issues found.' : `Issue: ${issueType}.`;
            const sheetMessage = punishmentSheetPath ? 'Punishment sheet uploaded.' : '';
            const body = `Vehicle ${safeVehicleNumber} checked in ${safeCity}. ${issueMessage} ${sheetMessage}`.trim();

            if (body.length > 320) {
              console.warn(`SMS message exceeds recommended length of 320 characters (${body.length} characters). Consider shortening for better deliverability.`);
            }

            console.log(`Preparing SMS: vehicleNumber=${safeVehicleNumber}, city=${safeCity}, issue=${issueType}, sheet=${!!punishmentSheetPath}`);
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
      console.log(`No related policemen with Attendace: true found in ${city}`);
    }

    await uploads.create(newVehicleCheck);

    res.status(200).json({ message: 'Vehicle check submitted successfully', city: city });
  } catch (error) {
    console.error('Error submitting vehicle check:', error);
    res.status(500).json({ error: 'Failed to submit vehicle check' });
  }
});

router.post('/login2', async (req, res) => {
  try {
    const { district, city, ID } = req.body;

    console.log("Policeman login request:", district, city, ID);
    if (!district || !city || !ID) {
      return res.status(400).json({ success: false, message: 'District, city, and ID are required' });
    }

    const policeman = await Pdetails.findOne({ ID: parseInt(ID) });
    if (!policeman) {
      return res.status(401).json({ success: false, message: 'Invalid policeman ID' });
    }

    if (policeman.city !== city) {
      return res.status(401).json({ success: false, message: 'City does not match the policeman’s registered city' });
    }

    return res.status(200).json({ success: true, message: 'Policeman login successful', city });
  } catch (error) {
    console.error('Error during policeman login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



const path = require('path');
const fs = require('fs').promises;



const uploadsDir = path.join(__dirname, '..', 'uploads');
console.log(`Serving static files from: ${uploadsDir}`); 
router.use('/uploads', express.static(uploadsDir, {
  
  fallthrough: false,
  setHeaders: (res, path) => {
    console.log(`Serving file: ${path}`); 
  },
}));


router.get('/history', async (req, res) => {
  try {
    const { city, month, year } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    let query = { city };
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const checkpoints = await uploads.find(query).sort({ createdAt: -1 });

    const pdetails = await Pdetails.find({ city });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const historyData = await Promise.all(checkpoints.map(async (checkpoint) => {
      const pdetail = pdetails.find(p => p.ID === checkpoint.policemanId);
      const policemanName = pdetail ? pdetail.name : 'Unknown';
      let photoPath = checkpoint.photoPath || null;
      let fileExists = false;

      if (photoPath && !photoPath.startsWith('http')) {
        photoPath = photoPath.replace(/^uploads[/\\]+/, '').replace(/\\/g, '/');
        const absolutePath = path.join(uploadsDir, photoPath);

        try {
          await fs.access(absolutePath);
          fileExists = true;
          photoPath = `${baseUrl}/uploads/${photoPath}`; 
        } catch (error) {
          console.error(`File not found: ${absolutePath}`);
          photoPath = null; 
        }
      }

      console.log(`Checkpoint ID: ${checkpoint._id}, Photo Path: ${photoPath}, File Exists: ${fileExists}`);

      return {
        id: checkpoint._id,
        violationType: checkpoint.violationType || 'None',
        issueType: checkpoint.issueType || 'No Issues',
        photoPath,
        date: checkpoint.createdAt,
        policemanName,
        city: checkpoint.city,
      };
    }));

    res.status(200).json(historyData);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/attendance-summary', async (req, res) => {
  try {
    const { month, year, city } = req.query;
    console.log(`Fetching monthly summary for city: ${city}, month: ${month}, year: ${year}`);

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);

    const checkpoints = await uploads.find({
      city,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    const pdetails = await Pdetails.find({ city });

    const attendanceRecords = await Atten.find({
      city,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    const attendanceSummary = attendanceRecords
      .filter(record => record.Attendace) 
      .map(record => {
        const pdetail = pdetails.find(p => p.ID === record.ID);
        return {
          ID: record.ID,
          name: pdetail ? pdetail.name : 'Unknown',
          city: record.city,
          date: record.date,
        };
      });

    const enrichedCheckpoints = checkpoints.map(checkpoint => {
      const pdetail = pdetails.find(p => p.ID === checkpoint.policemanId);
      return {
        ...checkpoint.toObject(),
        policemanName: pdetail ? pdetail.name : 'Unknown',
        vehicleNumber: checkpoint.vehicleNumber || 'N/A',
        actionTaken: checkpoint.actionTaken || 'Pending',
      };
    });

    console.log(`Returning ${enrichedCheckpoints.length} checkpoints and ${attendanceSummary.length} attendance records`);

    res.status(200).json({
      checkpoints: enrichedCheckpoints,
      attendanceSummary,
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

module.exports = router;