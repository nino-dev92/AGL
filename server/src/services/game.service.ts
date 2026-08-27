import Games from "../models/Games";
import ApiError from "../utils/apiError";
import cloudinary from "../config/cloudinary";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { validateImageBuffer } from "../utils/validateImage";
import logger from "../logger/logger";
import { Types } from "mongoose";
import Users from "../models/Users";
import { GameDTO } from "../types/game.types";

export const addGame = async (userId: string, data: GameDTO) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  // Case-insensitive duplicate check
  const existingGame = await Games.findOne({
    name: {
      $regex: `^${data.name.trim()}$`,
      $options: "i",
    },
  });

  if (existingGame) {
    throw new ApiError("Game already exists", 409);
  }

  const newGame = await Games.create({
    name: data.name.trim(),
    category: data.category.trim(),
  });

  return newGame;
};

export const editGame = async (
  userId: string,
  gameId: string,
  data: GameDTO,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(gameId)) {
    throw new ApiError("Invalid game ID", 400);
  }

  const [user, game] = await Promise.all([
    Users.findById(userId),
    Games.findById(gameId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  // If the name is being changed, ensure another game
  // does not already have that name.
  if (data.name) {
    const existingGame = await Games.findOne({
      _id: { $ne: gameId },
      name: {
        $regex: `^${data.name.trim()}$`,
        $options: "i",
      },
    });

    if (existingGame) {
      throw new ApiError("Game name already exists", 409);
    }

    game.name = data.name.trim();
  }

  if (data.category) {
    game.category = data.category.trim();
  }

  await game.save();

  return game;
};

export const findAllGames = async (
  search: string,
  page: number,
  limit: number,
) => {
  const filter: Record<string, unknown> = {};

  const skip = (page - 1) * limit;

  if (search.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const [games, total] = await Promise.all([
    Games.find(filter).limit(limit).skip(skip).sort({ name: 1 }),

    Games.countDocuments(filter),
  ]);

  return {
    games,
    total,
  };
};

export const findGameById = async (gameId: string) => {
  if (!Types.ObjectId.isValid(gameId)) {
    throw new ApiError("Invalid game ID", 400);
  }

  const game = await Games.findById(gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
};

export const updateGamePicture = async (
  userId: string,
  gameId: string,
  file: Express.Multer.File,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(gameId)) {
    throw new ApiError("Invalid game ID", 400);
  }

  const [user, game] = await Promise.all([
    Users.findById(userId),
    Games.findById(gameId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  // Validate the actual file contents
  await validateImageBuffer(file.buffer);

  const oldPicture = game.picture;

  // Upload the new image
  const uploadResult = await uploadToCloudinary(file.buffer, "AGL/games");

  try {
    game.picture = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await game.save();
  } catch (error) {
    // Database failed, so remove the newly uploaded image
    // to avoid leaving an orphaned Cloudinary file.
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

  // New picture was successfully saved.
  // Now remove the old Cloudinary picture.
  if (oldPicture?.publicId) {
    try {
      await cloudinary.uploader.destroy(oldPicture.publicId);
    } catch (error) {
      logger.error("Failed to delete old game picture", error);
    }
  }

  return {
    picture: game.picture,
  };
};

export const deleteGamePicture = async (userId: string, gameId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(gameId)) {
    throw new ApiError("Invalid game ID", 400);
  }

  const [user, game] = await Promise.all([
    Users.findById(userId),
    Games.findById(gameId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  if (!game.picture?.publicId) {
    throw new ApiError("No picture found", 404);
  }

  const picturePublicId = game.picture.publicId;

  // Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(picturePublicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError("Failed to delete picture", 500);
  }

  // Remove from MongoDB
  game.picture = undefined;

  await game.save();

  return null;
};

export const deleteGame = async (userId: string, gameId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(gameId)) {
    throw new ApiError("Invalid game ID", 400);
  }

  const [user, game] = await Promise.all([
    Users.findById(userId),
    Games.findById(gameId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  // Remove the game's picture from Cloudinary first.
  if (game.picture?.publicId) {
    const result = await cloudinary.uploader.destroy(game.picture.publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new ApiError("Failed to delete game picture", 500);
    }
  }

  await Games.findByIdAndDelete(gameId);

  return null;
};
