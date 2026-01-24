import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  console.log("🔍 Login attempt - Request received");
  console.log("Username:", username);
  console.log("JWT_SECRET set:", !!process.env.JWT_SECRET);

  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not set");
      return res.status(500).json({
        error: "Server configuration error: JWT_SECRET not set",
      });
    }

    // Validate input
    if (!username || !password) {
      console.log("❌ Missing username or password");
      return res.status(400).json({
        error: "Username dan password harus diisi",
      });
    }

    console.log("🔍 Searching for admin with username:", username);
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      console.log("❌ Admin not found for username:", username);
      return res.status(401).json({ error: "Username atau password salah" });
    }

    console.log("✅ Admin found:", {
      id: admin.id_admin,
      username: admin.username,
    });

    console.log("🔐 Verifying password...");
    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      console.log("❌ Password verification failed");
      return res.status(401).json({ error: "Username atau password salah" });
    }

    console.log("✅ Password verified successfully");

    console.log("🎫 Generating JWT token...");
    const token = jwt.sign(
      { id: admin.id_admin, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    console.log("✅ Token generated successfully");

    const response = {
      message: "Login berhasil",
      token,
      user: {
        id: admin.id_admin,
        username: admin.username,
        role: "admin",
      },
    };

    console.log("📤 Sending successful response");
    res.json(response);
  } catch (err) {
    console.error("❌ Login error:", err);
    console.error("Error stack:", err.stack);

    // Provide specific error messages based on error type
    let errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi.";

    if (err.name === "SequelizeConnectionError") {
      errorMessage = "Database connection error. Please try again later.";
    } else if (err.name === "SequelizeValidationError") {
      errorMessage = "Invalid data format.";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Token generation error.";
    } else if (err.name === "SequelizeDatabaseError") {
      errorMessage = "Database error occurred.";
    }

    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({
      message: "Token valid",
      user: {
        ...req.user,
        role: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
