const Property = require("../models/Property");
const axios = require('axios'); // For sending HTTP requests to Flask API

// Function to create a property
const createProperty = async (req, res) => {
  try {
    const { title, location, propertyType, areaSize, price, priceMin, priceMax } = req.body;

    // Validate fields (required fields)
    if (!title || !location || !propertyType || !areaSize || !price || !req.files.image || !req.files.document) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get file paths
    const imageUrl = req.files.image[0].path;
    const documentUrl = req.files.document[0].path;

    // Prepare property details for anomaly check
    const propertyDetails = {
      title,
      location,
      propertyType,
      areaSize,
      price,
      priceMin,
      priceMax,
    };

    // Call the Flask API for price anomaly detection
    const anomalyResponse = await axios.post('http://localhost:5000/validateProperty', propertyDetails);

    // Check if the price is anomalous
    if (anomalyResponse.data.isAnomaly) {
      // Inform the seller and the admin
      return res.status(400).json({
        isAnomaly: true,
        message: anomalyResponse.data.message,
      });
    }

    // If no anomaly detected, create the property
    const property = new Property({
      title,
      location,
      propertyType,
      areaSize,
      price,
      image: imageUrl,
      document: documentUrl,
      status: 'Pending Review',  // Property status is "Pending" until admin reviews it
      user: req.user.id,
    });

    await property.save();
    res.status(201).json({ message: "Property submitted for approval", property });

  } catch (error) {
    console.error('Error in property creation:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// propertyController.js
const { checkPriceValidity } = require('../mlModel');  // Assuming you have the ML logic here

// Function to validate the property price using the ML model
exports.validatePropertyPrice = async (req, res) => {
  try {
    const propertyDetails = req.body;  // Extract property details from the request body

    // Validate the price using the ML model
    const isAnomaly = await checkPriceValidity(propertyDetails);

    if (isAnomaly) {
      return res.json({ isAnomaly: true, message: 'Anomaly detected! The property price needs review.' });
    } else {
      return res.json({ isAnomaly: false, message: 'The property price is valid.' });
    }
  } catch (error) {
    console.error('Error in price validation:', error);
    return res.status(500).json({ message: 'Error during anomaly detection', error: error.message });
  }
};
module.exports = { createProperty };