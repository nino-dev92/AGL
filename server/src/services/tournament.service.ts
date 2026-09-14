import Tournaments from "../models/Tournaments";
import ApiError from "../utils/apiError";
import Users from "../models/Users";
import Games from "../models/Games";
import { Types } from "mongoose";
import { TournamentDTO, UpdateTournamentDTO } from "../types/tournament.types";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import cloudinary from "../config/cloudinary";
import { validateImageBuffer } from "../utils/validateImage";
import logger from "../logger/logger";

export const createNewTournament = async (
  userId: string,
  data: TournamentDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(data.game))
    throw new ApiError("Invalid game ID", 400);

  // check if user exists
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if game exists
  const game = await Games.findById(data.game);

  if (!game) throw new ApiError("Game not found", 404);

  // check if tournament name exists
  const exists = await Tournaments.findOne({
    name: data.name.toLowerCase().trim(),
  });

  if (exists) throw new ApiError("Tournament name already exists", 409);

  // validate tournament dates
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new ApiError("Start date must be earlier than the end date", 400);
  }

  // create tournament slug
  const slug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // check if slug already exists
  const existingSlug = await Tournaments.findOne({ slug });

  if (existingSlug) throw new ApiError("Tournament slug already exists", 409);

  // create new tournament
  const tournament = await Tournaments.create({
    name: data.name.toLowerCase().trim(),
    description: data.description || undefined,
    organizer: userId,
    slug,
    game: data.game,
    maxTeams: data.maxTeams,
    rules: data.rules ?? [],
    startDate: data.startDate,
    endDate: data.endDate,
  });

  return tournament;
};

export const getAllTournaments = async (
  search: string,
  game: string,
  page: number,
  limit: number,
) => {
  const filter: Record<string, unknown> = {};

  const skip = (page - 1) * limit;

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (game) {
    if (!Types.ObjectId.isValid(game))
      throw new ApiError("Invalid game ID", 400);

    filter.game = game;
  }

  // get all tournaments
  const allTournaments = await Tournaments.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("game", "name category");

  const total = await Tournaments.countDocuments(filter);

  return { allTournaments, total };
};

export const getTournamentById = async (tournamentId: string) => {
  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // get tournament
  const tournament = await Tournaments.findById(tournamentId)
    .populate("game", "name category")
    .populate("registeredTeams", "name slug logo");

  if (!tournament) throw new ApiError("Tournament not found", 404);

  return tournament;
};

export const editTournament = async (
  userId: string,
  tournamentId: string,
  data: UpdateTournamentDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // check if user and tournament exists
  const [user, tournament] = await Promise.all([
    Users.findById(userId),
    Tournaments.findById(tournamentId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if game exists
  if (data.game) {
    if (!Types.ObjectId.isValid(data.game))
      throw new ApiError("Invalid game ID", 400);

    const game = await Games.findById(data.game);

    if (!game) throw new ApiError("Game not found", 404);
  }

  // check if tournament name exists
  if (data.name) {
    const normalizedName = data.name.toLowerCase().trim();

    const exists = await Tournaments.findOne({
      name: normalizedName,
      _id: { $ne: tournamentId },
    });

    if (exists) throw new ApiError("Tournament name already exists", 409);

    // update tournament slug
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existingSlug = await Tournaments.findOne({
      slug,
      _id: { $ne: tournamentId },
    });

    if (existingSlug) throw new ApiError("Tournament slug already exists", 409);

    data.name = normalizedName;

    // Type assertion allows slug to be added without modifying the DTO
    const updateData = {
      ...data,
      slug,
    };

    // validate tournament dates
    const startDate = updateData.startDate ?? tournament.startDate;
    const endDate = updateData.endDate ?? tournament.endDate;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new ApiError("Start date must be earlier than the end date", 400);
    }

    // update tournament
    const update = await Tournaments.findByIdAndUpdate(
      tournamentId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return update;
  }

  // validate tournament dates
  const startDate = data.startDate ?? tournament.startDate;
  const endDate = data.endDate ?? tournament.endDate;

  if (new Date(startDate) >= new Date(endDate)) {
    throw new ApiError("Start date must be earlier than the end date", 400);
  }

  // update tournament
  const update = await Tournaments.findByIdAndUpdate(tournamentId, data, {
    new: true,
    runValidators: true,
  });

  return update;
};

export const updateTournamentBanner = async (
  userId: string,
  tournamentId: string,
  file: Express.Multer.File,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  if (!file) throw new ApiError("Banner image is required", 400);

  // check if user and tournament exists
  const [user, tournament] = await Promise.all([
    Users.findById(userId),
    Tournaments.findById(tournamentId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // Validate the actual image contents
  await validateImageBuffer(file.buffer);

  const oldBanner = tournament.banner;

  // Upload new banner
  const uploadResult = await uploadToCloudinary(file.buffer, "AGL/tournaments");

  try {
    // Save the new banner in MongoDB
    tournament.banner = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await tournament.save();
  } catch (error) {
    // MongoDB failed, so clean up the newly uploaded Cloudinary image
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

  // MongoDB was successfully updated now remove the old banner
  if (oldBanner?.publicId) {
    try {
      await cloudinary.uploader.destroy(oldBanner.publicId);
    } catch (error) {
      logger.error("Failed to delete old tournament banner", error);
    }
  }

  return {
    banner: tournament.banner,
  };
};

export const deleteTournamentBanner = async (
  userId: string,
  tournamentId: string,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // check if user and tournament exists
  const [user, tournament] = await Promise.all([
    Users.findById(userId),
    Tournaments.findById(tournamentId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if tournament banner exists
  if (!tournament.banner?.publicId)
    throw new ApiError("No tournament banner found", 404);

  const bannerPublicId = tournament.banner.publicId;

  // Delete image from Cloudinary
  const result = await cloudinary.uploader.destroy(bannerPublicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError("Failed to delete tournament banner", 500);
  }

  // Remove banner from MongoDB
  await Tournaments.updateOne(
    { _id: tournament._id },
    {
      $unset: {
        banner: 1,
      },
    },
  );

  return null;
};

export const changeTournamentStatus = async (
  userId: string,
  tournamentId: string,
  status:
    | "upcoming"
    | "registration-open"
    | "registration-closed"
    | "ongoing"
    | "completed"
    | "cancelled",
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // check if user and tournament exists
  const [user, tournament] = await Promise.all([
    Users.findById(userId),
    Tournaments.findById(tournamentId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // update status
  tournament.status = status;

  await tournament.save();

  return tournament;
};

export const deleteTournament = async (
  userId: string,
  tournamentId: string,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // check if user and tournament exists
  const [user, tournament] = await Promise.all([
    Users.findById(userId),
    Tournaments.findById(tournamentId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // delete tournament banner from Cloudinary
  if (tournament.banner?.publicId) {
    try {
      await cloudinary.uploader.destroy(tournament.banner.publicId);
    } catch (error) {
      logger.error(
        "Failed to delete tournament banner during tournament deletion",
        error,
      );
    }
  }

  // delete tournament
  await Tournaments.findByIdAndDelete(tournamentId);

  return null;
};
