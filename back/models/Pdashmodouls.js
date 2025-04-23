const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  photoPath: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  city: { type: String }, // Add city field
  createdAt: { type: Date, default: Date.now },
});



const users = mongoose.model('User', userSchema,"PDashboard");



module.exports= {users};