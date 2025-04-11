const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// User Signup Route
router.post("/signup", async (req, res) => {
    const { username, email, password, role } = req.body;

    // Allowed roles
    const allowedRoles = ["admin", "agent", "seller"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role selected" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        res.status(201).json({ message: "Account created successfully", role });
    } catch (error) {
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
});

// User Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Protected Route Example: Get User Profile
router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
});

module.exports = router;