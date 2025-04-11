const express = require("express");
const multer = require("multer");
const Property = require("../models/Property");
const { authenticateUser } = require("../middleware/authMiddleware");
const axios = require("axios");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Seller submits a property
router.post(
  "/",
  authenticateUser,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Seller Access Required" });
      }

      const { title, price, location, propertyType, areaSize } = req.body;

      if (!title || !price || !location || !propertyType || !areaSize) {
        return res.status(400).json({ message: "All fields are required." });
      }

      if (!req.files || !req.files.images || !req.files.documents) {
        return res.status(400).json({ message: "At least one image and document are required." });
      }

      const flaskResponse = await axios.post("http://127.0.0.1:5000/validateProperty", {
        location,
        propertyType,
        areaSize: parseFloat(areaSize),
        price: parseFloat(price),
      });

      const isAnomaly = flaskResponse.data.isAnomaly;
      const anomalyMessage = flaskResponse.data.message;

      const imagePaths = req.files.images.map((file) => file.path);
      const documentPaths = req.files.documents.map((file) => file.path);

      const property = new Property({
        title,
        price,
        location: { address: location },
        propertyType,
        areaSize,
        images: imagePaths,
        documents: documentPaths,
        seller: req.user._id,
        status: isAnomaly ? "Pending Review" : "Pending Admin Review",
        isAnomaly,
        anomalyMessage,
      });

      await property.save();

      res.status(201).json({
        message: "Property submitted for approval!",
        property,
        isAnomaly,
      });
    } catch (error) {
      console.error("❌ Error in property submission:", error);
      res.status(500).json({ message: "Failed to submit property", error: error.message });
    }
  }
);

// Fetch all properties (Admin & Agent)
router.get("/all", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
});

// Admin fetches pending properties
router.get("/pending", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const properties = await Property.find({
      status: { $in: ["Pending Admin Review", "Pending Review"] },
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending properties", error });
  }
});

// Admin approves property and moves to agent verification
router.put("/approve/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "Agent Assigned";
    await property.save();
    res.json({ message: "Approved and moved to Agent Verification", property });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error });
  }
});

// Admin rejects property
// Admin rejects property
router.delete("/reject/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Update the property status to "Rejected"
    property.status = "Rejected";
    await property.save();

    res.json({ message: "Property rejected", property });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject property", error });
  }
});

router.get('/agent-verification', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Agent access required' });
    }

    const properties = await Property.find({ status: 'Agent Assigned' });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties', error });
  }
});

// Agent verifies property and directly moves to "Listed" (Buyer Dashboard)
router.put("/verify/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "Listed"; // Move the property directly to the buyer dashboard
    await property.save();
    res.json({ message: "Property listed for buyers", property });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error });
  }
});

// Endpoint for fetching listed properties for buyers
router.get("/listed", async (req, res) => {
  try {
    const properties = await Property.find({ status: "Listed" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch listed properties", error });
  }
});

// Endpoint for property validation via Flask
router.post("/validateProperty", async (req, res) => {
  try {
    const propertyDetails = req.body;

    const response = await axios.post("http://127.0.0.1:5000/validateProperty", propertyDetails);

    res.json({
      isAnomaly: response.data.isAnomaly,
      message: response.data.message || "Validation complete",
    });
  } catch (error) {
    console.error("❌ Error in validateProperty route:", error.message);

    if (error.response) {
      console.error("💥 Flask responded with:", error.response.data);
      res.status(500).json({
        message: "Validation failed",
        error: error.message,
        flaskError: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Validation failed",
        error: error.message,
      });
    }
  }
});
router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Define Gemini API key and endpoint
    const GEMINI_API_KEY = "AIzaSyCr_Nyd76FJ8yhfOh92cm-7c8QauO_gOjI";  // Replace with your actual API key
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Send the message to Gemini API
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: userMessage }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Log the response to see if it's correct
    console.log("Gemini API response:", response.data);

    // Process the Gemini response
    const botResponse = response.data.generatedContent || "Sorry, I couldn't process your request. Please try again.";

    // Send the bot response back to the frontend
    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    res.status(500).json({ error: "Failed to get a response from the bot." });
  }
});
module.exports = router;