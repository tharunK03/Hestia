const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  propertyType: String,
  areaSize: String,
  images: [String], 
  documents: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned agent
  
  // ✅ Add "Pending Review" for anomaly cases
  status: { 
    type: String, 
    enum: [
      "Pending Admin Review", 
      "Pending Review",           // <-- Added "Pending Review" here for anomaly cases
      "Agent Assigned", 
      "Agent Submitted", 
      "Listed",                   // Final status after agent verification
      "Rejected",                 // Status when rejected
      "Rejected by Admin"         // Status when admin rejects the property (due to anomaly)
    ], 
    default: "Pending Admin Review" 
  },

  // Anomaly detection fields
  isAnomaly: {
    type: Boolean,
    default: false // Default to false, assuming no anomaly initially
  },
  anomalyMessage: {
    type: String,
    default: "" // Default empty message, can be populated based on anomaly detection
  },

  // Additional fields
  verificationReport: String, // Store agent's verification report
  createdAt: { type: Date, default: Date.now } // Timestamp for the property creation
});

module.exports = mongoose.model("Property", PropertySchema);