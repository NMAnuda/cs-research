const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  photoPath: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  city: { type: String }, 
  Action: { type: String },
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



const users = mongoose.model('User', userSchema,"PDashboard");
const Pdetails = mongoose.model('Pdetails', userSchema1,"Pdetails");
const Atten = mongoose.model('Atten', userSchema2,"Attendance");



module.exports= {users,Pdetails,Atten};