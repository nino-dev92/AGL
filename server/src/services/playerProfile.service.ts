import Users from "../models/Users";
import ApiError from "../utils/apiError";
import { UpdateProfileDTO } from "../types/playerProfile.types";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import cloudinary from "../config/cloudinary";
import { validateImageBuffer } from "../utils/validateImage";
import logger from "../logger/logger";

export const getMyProfile = async (userId: string) => {
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    country: user.country,
    game: user.game,
    playerRole: user.playerRole,
  };
};

export const updateProfile = async (userId: string, data: UpdateProfileDTO) => {
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (data.bio !== undefined) {
    user.bio = data.bio;
  }

  if (data.country !== undefined) {
    user.country = data.country;
  }

  if (data.game !== undefined) {
    user.game = data.game;
  }

  if (data.playerRole !== undefined) {
    user.playerRole = data.playerRole;
  }

  await user.save();

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    country: user.country,
    game: user.game,
    playerRole: user.playerRole,
    role: user.role,
  };
};

export const uploadAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Validate the actual file contents
  await validateImageBuffer(file.buffer);

  const oldAvatar = user.avatar;

  // Upload new image
  const uploadResult = await uploadToCloudinary(file.buffer, "AGL/players");

  try {
    // Save new avatar in MongoDB
    user.avatar = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await user.save();
  } catch (error) {
    // MongoDB failed.
    // Delete the newly uploaded image from Cloudinary
    // so we don't leave an orphaned file.
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id);
    } catch (cleanupError) {
      logger.error(
        "Failed to cleanup Cloudinary image after MongoDB failure",
        cleanupError,
      );
    }

    throw error;
  }

  // MongoDB successfully saved the new avatar now remove the old one.
  if (oldAvatar?.publicId) {
    try {
      await cloudinary.uploader.destroy(oldAvatar.publicId);
    } catch (error) {
      logger.error("Failed to delete old avatar", error);
    }
  }

  return {
    avatar: user.avatar,
  };
};

export const deleteAvatar = async (userId: string) => {
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.avatar?.publicId) {
    throw new ApiError("No avatar found", 404);
  }

  const avatarPublicId = user.avatar.publicId;

  // Delete image from Cloudinary
  const result = await cloudinary.uploader.destroy(avatarPublicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError("Failed to delete avatar", 500);
  }

  // Remove avatar from MongoDB
  await Users.updateOne(
    { _id: user._id },
    {
      $unset: { avatar: 1 },
    },
  );

  await user.save();

  return null;
};

export const deleteProfile = async (id: string) => {
  const deleteUser = await Users.findByIdAndDelete(id);

  if (!deleteUser) throw new ApiError("User not found", 404);

  return;
};
