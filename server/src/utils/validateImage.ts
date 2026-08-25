import { fileTypeFromBuffer } from "file-type";
import ApiError from "./apiError";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export const validateImageBuffer = async (buffer: Buffer) => {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new ApiError("Unable to determine image file type", 400);
  }

  if (!allowedImageTypes.includes(fileType.mime)) {
    throw new ApiError("Only JPEG, PNG and WebP images are allowed", 400);
  }

  return fileType;
};
