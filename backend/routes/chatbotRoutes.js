const express = require("express");
const axios = require("axios");
const router = express.Router();

// Define Gemini API key and endpoint
const GEMINI_API_KEY = "AIzaSyCr_Nyd76FJ8yhfOh92cm-7c8QauO_gOjI";  // Use the actual API key here
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Chatbot route to handle user input
router.post("/chat", async (req, res) => {
  try {
    // Get the user message from the request body
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    // Send the user message to the Gemini API
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

    // Check if the response contains generated content
    const botResponse = response.data.candidates && response.data.candidates[0]
      ? response.data.candidates[0].content.parts[0].text
      : "Sorry, I couldn't process your request. Please try again.";

    // Return the bot response to the frontend
    res.json({ reply: botResponse });

  } catch (error) {
    // Log the error and return a failure message
    console.error("Error in chatbot route:", error);
    res.status(500).json({ error: "Failed to get a response from the bot." });
  }
});

module.exports = router;