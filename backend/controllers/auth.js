import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log("Username input:", username);
    console.log("Password input:", password);
    const admin = await Admin.findOne({ where: { username } });
    console.log("Admin found:", admin ? "YES" : "NO");
    if (admin) {
      console.log("Hash in DB:", admin.password);
    }
    if (!admin)
      return res.status(401).json({ error: "Username atau password salah" });

    const valid = await bcrypt.compare(password, admin.password);
    console.log("Compare result:", valid);
    if (!valid) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: admin.id_admin, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: admin.id_admin,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({
      message: "Token valid",
      user: req.user,
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
