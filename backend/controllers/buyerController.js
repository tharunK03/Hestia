const Property = require("../models/Property");

// Get all properties that are listed and visible to buyers
const getListedProperties = async (req, res) => {
  try {
    // Ensure the user is a buyer (optional, as you might want buyers to only fetch listed properties)
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Buyer access required" });
    }

    // Find all properties with status "Listed"
    const properties = await Property.find({ status: "Listed" });
    if (!properties) {
      return res.status(404).json({ message: "No listed properties found" });
    }

    // Send the properties data as a response
    res.json(properties);
  } catch (error) {
    console.error("❌ Error fetching listed properties:", error);
    res.status(500).json({ message: "Failed to fetch listed properties", error });
  }
};

module.exports = { getListedProperties };