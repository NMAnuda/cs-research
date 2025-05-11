const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  photoPath: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  city: { type: String }, 
  actionTaken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema1 = new mongoose.Schema({
  phoneno: { type: Number, required: true },
  name: { type: String },
  ID: { type: Number },
  city: { type: String }, 
});


const userSchema2 = new mongoose.Schema({

  ID: { type: Number },
  city: { type: String },
  Attendace: { type: Boolean }, 
  date: { type: Date, default: Date.now },
  
});


const userSchema4 = new mongoose.Schema({
  vehicleNumber: { type: String },
  city: { type: String },
  violationType: { 
    type: String, 
    enum: ['Cross Road Line', 'High Speed', 'No Parking', 'Red Light Violation', null], 
    default: null 
  },
  issueType: { 
    type: String, 
    enum: ['No Issues', 'Driving License', 'Revenue License', 'Insurance Certificate', 'Vehicle Registration Certificate', 'Emission Test Certificate', null], 
    default: null 
  },
  photoPath: { type: String, default: null },
  punishmentSheetPath: { type: String, default: null },
  policemanId: { type: Number, default: null }, // Added policemanId field
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: null }, // To differentiate between violation and vehicle-check
  actionTaken: { type: String, default: 'Pending' },
});



const users = mongoose.model('User', userSchema,"PDashboard");
const Pdetails = mongoose.model('Pdetails', userSchema1,"Pdetails");
const Atten = mongoose.model('Atten', userSchema2,"Attendance");
const uploads = mongoose.model('uploads', userSchema4,"");



module.exports= {users,Pdetails,Atten,uploads};