import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: "Akses ditolak", 
        message: "Token tidak ditemukan dalam header Authorization" 
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: "Akses ditolak", 
        message: "Format token tidak valid. Gunakan: Bearer <token>" 
      });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET tidak terdefinisi");
      return res.status(500).json({ 
        error: "Konfigurasi server error", 
        message: "JWT_SECRET tidak terdefinisi" 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token expired", 
        message: "Token sudah kadaluarsa, silakan login ulang" 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ 
        error: "Token tidak valid", 
        message: "Token yang diberikan tidak valid" 
      });
    }
    
    return res.status(500).json({ 
      error: "Server error", 
      message: "Terjadi kesalahan saat memverifikasi token" 
    });
  }
};

export default auth;
