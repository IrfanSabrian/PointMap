// Test server startup
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Simple CORS configuration
app.use(cors({
  origin: [
    "https://pointmap.vercel.app",
    "https://pointmap-production.up.railway.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
