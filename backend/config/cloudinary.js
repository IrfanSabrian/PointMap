import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// If CLOUDINARY_URL is set, SDK will read it automatically.
// We only set `secure` to true. Otherwise, fall back to explicit keys.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dp5jvgkqp",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;
