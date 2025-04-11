const Property = require("../models/Property");

// Final Admin Approval - Mark Property as "Listed"
const finalApproveProperty = async (req, res) => {
  try {
    // Check if the user is a senior admin
    if (req.user.role !== "senioradmin") {
      return res.status(403).json({ message: "Senior Admin access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.status === "Listed") {
      return res.status(400).json({ message: "Property already listed" });
    }

    // Move the property to the "Listed" status
    property.status = "Listed";
    await property.save();

    res.json({
      message: "Property successfully approved and moved to Buyer Dashboard.",
      property,
    });
  } catch (error) {
    console.error("❌ Error in final approval:", error);
    res.status(500).json({ message: "Final approval failed", error });
  }
};

module.exports = { finalApproveProperty };

