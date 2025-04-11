// In agentController.js
const Property = require("../models/Property");

// Agent verifies the property and moves it to "Final Admin Review"
const Property = require("../models/Property");

const Property = require("../models/Property");

const verifyProperty = async (req, res) => {
  try {
    // Check if the user is an agent
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    // Find the property by ID
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Update property status to "Listed" for buyer visibility
    property.status = "Listed";  // Change status to "Listed" to move the property to the Buyer Dashboard
    await property.save();

    res.json({ message: "Property verified by agent and moved to Buyer Dashboard", property });
  } catch (error) {
    console.error("❌ Error verifying property:", error);
    res.status(500).json({ message: "Verification failed", error });
  }
};

module.exports = { verifyProperty };

module.exports = { verifyProperty };

const approveProperty = async (propertyId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:8080/api/agent/verify/${propertyId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert("✅ Property approved and listed in buyer dashboard!");
    fetchPendingProperties(); // Refresh list after approval
  } catch (error) {
    console.error("Error approving property:", error);
    alert("❌ Approval failed. Please check backend logs.");
  }
};

// Reject property
const rejectProperty = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.status = "Rejected";
    await property.save();
    res.json({ message: "Property rejected successfully", property });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({ message: "Rejection failed", error });
  }
};

module.exports = { verifyProperty, rejectProperty };