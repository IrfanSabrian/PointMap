import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin)
      return res.status(401).json({ error: "Username atau password salah" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return res.status(401).json({ error: "Username atau password salah" });

    const token = jwt.sign(
      { id: admin.id_admin, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: admin.id_admin,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Terjadi kesalahan pada server. Silakan coba lagi." });
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
