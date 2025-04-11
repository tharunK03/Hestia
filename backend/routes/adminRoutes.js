const express = require("express");
const Property = require("../models/Property");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get all pending properties (Admin only)
router.get("/pending", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const properties = await Property.find({ status: "Pending Admin Review" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending properties", error });
  }
});

// ✅ Approve property and move to agent verification (Admin only)
router.put("/approve/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.status === "Agent Assigned") {
      return res.status(400).json({ message: "Property is already in Agent Verification" });
    }

    property.status = "Agent Assigned";
    await property.save();
    
    res.json({ message: "Property approved and moved to agent verification", property });
  } catch (error) {
    console.error("❌ Error approving property:", error);
    res.status(500).json({ message: "Approval failed", error });
  }
});

// ✅ Reject property and delete (Admin only)
router.delete("/reject/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property rejected and removed" });
  } catch (error) {
    console.error("❌ Error rejecting property:", error);
    res.status(500).json({ message: "Failed to reject property", error });
  }
});

module.exports = router;