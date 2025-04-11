require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// 🟢 Import Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const agentRoutes = require('./routes/agentRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const renterRoutes = require('./routes/renterRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes'); // New chatbot route

const app = express();

// 🟢 Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// 🟢 Database Connection
connectDB();

// 🟢 Ensure All Routes Are Correctly Used
if (typeof authRoutes === 'function') app.use('/api/auth', authRoutes);
if (typeof propertyRoutes === 'function') app.use('/api/properties', propertyRoutes);
if (typeof adminRoutes === 'function') app.use('/api/admin', adminRoutes);
if (typeof agentRoutes === 'function') app.use('/api/agent', agentRoutes);
if (typeof buyerRoutes === 'function') app.use('/api/buyer', buyerRoutes);
if (typeof renterRoutes === 'function') app.use('/api/renter', renterRoutes);
if (typeof chatbotRoutes === 'function') app.use('/api/chat', chatbotRoutes); // Register the chatbot route

// 🟢 Serve Static Files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🟢 Default Route
app.get("/", (req, res) => {
    res.send("🚀 Real Estate Backend is Running...");
});

// 🟢 Global Error Handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 🟢 Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));