import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/Cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "medical_reports",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const reportUpload = multer({ storage });

export default reportUpload;
