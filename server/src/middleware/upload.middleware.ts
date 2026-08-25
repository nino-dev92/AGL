import multer from "multer";
import path from "path";
import ApiError from "../utils/apiError";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const extension = path.extname(file.originalname).toLowerCase();

  const validMimeType = allowedMimeTypes.includes(file.mimetype);

  const validExtension = allowedExtensions.includes(extension);

  if (!validMimeType && !validExtension) {
    return cb(new ApiError("Only JPEG, PNG and WebP images are allowed", 400));
  }

  cb(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;
