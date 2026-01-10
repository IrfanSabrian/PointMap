import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await db.sync(); // Ensure connection

    const username = "admin";
    const password = "admin123";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [admin, created] = await Admin.findOrCreate({
      where: { username },
      defaults: {
        username,
        password: hashedPassword,
      },
    });

    if (created) {
      console.log("✅ Admin created successfully.");
      console.log("Username:", username);
      console.log("Password:", password);
    } else {
      console.log("⚠️ Admin already exists.");
      // Update password just in case
      admin.password = hashedPassword;
      await admin.save();
      console.log("✅ Admin password updated.");
      console.log("Username:", username);
      console.log("Password:", password);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
