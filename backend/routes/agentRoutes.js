const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const Property = require("../models/Property");
const router = express.Router();

// ✅ Get pending properties for agent verification
router.get("/pending-properties", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    const properties = await Property.find({ status: "Agent Assigned" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
});

// ✅ Agent Verifies Property and Moves it to "Listed" for Buyer Dashboard
router.put("/verify/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if property is already listed or verified
    if (property.status === "Listed") {
      return res.status(400).json({ message: "Property is already listed" });
    }

    // Update the property status to "Listed" for Buyer Dashboard
    property.status = "Listed"; // Move property to Buyer Dashboard
    await property.save();

    res.json({ message: "Property verified by agent and moved to Buyer Dashboard", property });
  } catch (error) {
    console.error("Error verifying property:", error);
    res.status(500).json({ message: "Verification failed", error });
  }
});

// ✅ Reject property
router.put("/reject/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.status = "Rejected"; // Reject the property
    await property.save();

    res.json({ message: "Property rejected", property });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({ message: "Rejection failed", error });
  }
});

module.exports = router;