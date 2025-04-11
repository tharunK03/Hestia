const express = require('express');
const Property = require('../models/Property');

const router = express.Router();

// Get All Approved Properties for Buyers
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find({ status: 'Listed' });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Error fetching properties", error });
    }
});

module.exports = router;