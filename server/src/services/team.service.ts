import Teams from "../models/Teams";
import Users from "../models/Users";
import ApiError from "../utils/apiError";
import { CreateTeamDTO, EditTeamDTO } from "../types/team.types";
import { Types } from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import cloudinary from "../config/cloudinary";
import { validateImageBuffer } from "../utils/validateImage";
import logger from "../logger/logger";

export const createTeam = async (userId: string, data: CreateTeamDTO) => {
  // Validate manager ID
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  // Check if manager exists
  const checkManager = await Users.findById(userId);

  if (!checkManager) {
    throw new ApiError("User not found", 404);
  }

  // Verify user role
  if (checkManager.role !== "manager") {
    throw new ApiError("Team creator must be a manager", 400);
  }

  // Normalize team name
  const teamName = data.name.trim();

  // Check if team name already exists
  const existingTeamName = await Teams.findOne({
    name: {
      $regex: `^${teamName}$`,
      $options: "i",
    },
  });

  if (existingTeamName) {
    throw new ApiError("Team name already exists", 409);
  }

  // Generate slug
  const slug = teamName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Check if slug already exists
  const existingSlug = await Teams.findOne({ slug });

  if (existingSlug) {
    throw new ApiError("Team slug already exists", 409);
  }

  // Create team
  const newTeam = await Teams.create({
    name: teamName,
    slug,
    manager: data.manager,
    captain: data.captain || "",
    members: data.captain ? [data.captain] : [],
    game: new Types.ObjectId(data.game.trim()),
    description: data.description?.trim() || "",
    maxMembers: data.maxMembers,
  });

  return newTeam;
};

export const getAllTeams = async (
  search: string,
  page: number,
  limit: number,
  game: string,
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
    filter.game = {
      $regex: `^${game}$`,
      $options: "i",
    };
  }

  const [allTeams, total] = await Promise.all([
    Teams.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("captain", "userName")
      .populate("members", "userName"),

    Teams.countDocuments(filter),
  ]);

  return {
    teams: allTeams,
    totalTeams: total,
  };
};

export const getTeamById = async (teamId: string) => {
  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  const selectedTeam = await Teams.findById(teamId)
    .populate("captain", "userName")
    .populate("members", "userName");

  if (!selectedTeam) {
    throw new ApiError("Team not found", 404);
  }

  return selectedTeam;
};

export const updateTeam = async (
  userId: string,
  teamId: string,
  data: EditTeamDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(teamId))
    throw new ApiError("Invalid team ID", 400);

  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const team = await Teams.findById(teamId);

  if (!team) throw new ApiError("Team not found", 404);

  // Only admin or the captain of this team can update it
  const isAdminOrManager = user.role === "admin" || user.role !== "manager";

  const isManager = team.manager.toString() === user._id.toString();

  if (!isAdminOrManager && !isManager)
    throw new ApiError("You do not have permission to update this team", 403);

  // Prevent maxMembers from becoming smaller
  // than the current number of members
  if (data.maxMembers !== undefined && data.maxMembers < team.members.length) {
    throw new ApiError(
      "Maximum members cannot be less than the current number of team members",
      400,
    );
  }

  // If name is being changed, handle name and slug
  if (data.name) {
    const teamName = data.name.trim();

    const existingTeam = await Teams.findOne({
      name: {
        $regex: `^${teamName}$`,
        $options: "i",
      },
      _id: { $ne: teamId },
    });

    if (existingTeam) {
      throw new ApiError("Team name already exists", 409);
    }

    data.name = teamName;

    data.slug = teamName.toLowerCase().replace(/\s+/g, "-");
  }

  const updatedTeam = await Teams.findByIdAndUpdate(teamId, data, {
    new: true,
    runValidators: true,
  })
    .populate("captain", "userName")
    .populate("members", "userName");

  if (!updatedTeam) {
    throw new ApiError("Team not found", 404);
  }

  return updatedTeam;
};

export const updateTeamLogo = async (
  userId: string,
  teamId: string,
  file: Express.Multer.File,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(teamId))
    throw new ApiError("Invalid team ID", 400);

  if (!file) throw new ApiError("Logo image is required", 400);

  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const team = await Teams.findById(teamId);

  if (!team) throw new ApiError("Team not found", 404);

  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  const isManager = team.manager.toString() === user._id.toString();

  if (!isAdminOrManager && !isManager)
    throw new ApiError(
      "You do not have permission to update this team's logo",
      403,
    );

  // Validate the actual image contents
  await validateImageBuffer(file.buffer);

  const oldLogo = team.logo;

  // Upload new logo
  const uploadResult = await uploadToCloudinary(file.buffer, "AGL/teams");

  try {
    // Save the new logo in MongoDB
    team.logo = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await team.save();
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

  // MongoDB was successfully updated now remove the old logo.
  if (oldLogo?.publicId) {
    try {
      await cloudinary.uploader.destroy(oldLogo.publicId);
    } catch (error) {
      logger.error("Failed to delete old team logo", error);
    }
  }

  return {
    logo: team.logo,
  };
};

export const deleteTeamLogo = async (userId: string, teamId: string) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(teamId))
    throw new ApiError("Invalid team ID", 400);

  // check if user and team exist
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const team = await Teams.findById(teamId);

  if (!team) throw new ApiError("Team not found", 404);

  // verify user role
  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  const isManager = team.manager.toString() === user._id.toString();

  if (!isAdminOrManager && !isManager) throw new ApiError("Forbidden", 403);

  if (!team.logo?.publicId) throw new ApiError("No team logo found", 404);

  const logoPublicId = team.logo.publicId;

  // Delete image from Cloudinary
  const result = await cloudinary.uploader.destroy(logoPublicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError("Failed to delete team logo", 500);
  }

  // Remove logo from MongoDB
  await Teams.updateOne({ _id: team._id }, { $unset: { logo: 1 } });

  await team.save();

  return null;
};

export const changeTeamCaptain = async (
  userId: string,
  teamId: string,
  newCaptainId: string,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(teamId))
    throw new ApiError("Invalid team ID", 400);

  if (!Types.ObjectId.isValid(newCaptainId))
    throw new ApiError("Invalid new captain ID", 400);

  const [user, team] = await Promise.all([
    Users.findById(userId),
    Teams.findById(teamId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!team) throw new ApiError("Team not found", 404);

  // Only admin can change the captain
  if (user.role !== "admin") throw new ApiError("Forbidden", 403);

  // Cannot assign the current captain again
  if (team.manager.toString() === newCaptainId)
    throw new ApiError("Selected player is already the team captain", 400);

  // New captain must already be a member
  const existingMember = team.members.some(
    (member) => member.toString() === newCaptainId,
  );

  if (!existingMember)
    throw new ApiError("Selected player must already be a team member", 400);

  team.manager = new Types.ObjectId(newCaptainId);

  await team.save();

  return team;
};

export const addTeamMember = async (
  userId: string,
  teamId: string,
  memberIds: Types.ObjectId[],
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  const [user, dbTeam] = await Promise.all([
    Users.findById(userId),
    Teams.findById(teamId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!dbTeam) {
    throw new ApiError("Team not found", 404);
  }

  // Admin OR this team's captain can add members
  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  const isManager = dbTeam.manager.toString() === user._id.toString();

  if (!isAdminOrManager && !isManager) {
    throw new ApiError(
      "You do not have permission to add members to this team",
      403,
    );
  }

  if (!memberIds || memberIds.length === 0) {
    throw new ApiError("At least one member is required", 400);
  }

  // Remove duplicate IDs from incoming request
  const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];

  // Remove users who are already members
  const currentMemberIds = new Set(
    dbTeam.members.map((member) => member.toString()),
  );

  const newMemberIds = uniqueMemberIds.filter(
    (memberId) => !currentMemberIds.has(memberId),
  );

  if (newMemberIds.length === 0) {
    throw new ApiError(
      "All selected users are already members of this team",
      400,
    );
  }

  // Check team capacity
  if (dbTeam.members.length + newMemberIds.length > dbTeam.maxMembers) {
    throw new ApiError(
      `Adding these members would exceed the team limit of ${dbTeam.maxMembers}`,
      400,
    );
  }

  // Fetch all requested new members
  const users = await Users.find({
    _id: {
      $in: newMemberIds,
    },
  });

  // Ensure every requested user exists
  if (users.length !== newMemberIds.length) {
    throw new ApiError("One or more selected users do not exist", 404);
  }

  // Ensure every user is a player
  const invalidMember = users.find((member) => member.role !== "player");

  if (invalidMember) {
    throw new ApiError("All team members must have the player role", 400);
  }

  // Add members
  dbTeam.members.push(
    ...newMemberIds.map((memberId) => new Types.ObjectId(memberId)),
  );

  await dbTeam.save();

  return await dbTeam.populate([
    {
      path: "captain",
      select: "userName",
    },
    {
      path: "members",
      select: "userName",
    },
  ]);
};

export const deleteTeamMember = async (
  userId: string,
  teamId: string,
  memberId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  if (!Types.ObjectId.isValid(memberId)) {
    throw new ApiError("Invalid member ID", 400);
  }

  const [user, team] = await Promise.all([
    Users.findById(userId),
    Teams.findById(teamId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!team) {
    throw new ApiError("Team not found", 404);
  }

  const isManager = user._id.toString() === team.manager.toString();

  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  // Only admin or captain can remove members
  if (!isAdminOrManager && !isManager) {
    throw new ApiError("Forbidden", 403);
  }

  // Check if the member exists
  const existingMember = team.members.some(
    (member) => member.toString() === memberId,
  );

  if (!existingMember) {
    throw new ApiError("Team member not found", 404);
  }

  // Captain cannot be removed without transferring captaincy first
  if (team.manager.toString() === memberId) {
    throw new ApiError(
      "Transfer captaincy before removing the current captain",
      400,
    );
  }

  team.members = team.members.filter(
    (member) => member.toString() !== memberId,
  );

  await team.save();

  return team;
};

export const leaveTeam = async (userId: string, teamId: string) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(teamId))
    throw new ApiError("Invalid team ID", 400);

  const [user, team] = await Promise.all([
    Users.findById(userId),
    Teams.findById(teamId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!team) throw new ApiError("Team not found", 404);

  // User must be a member of the team
  const isMember = team.members.some((member) => member.toString() === userId);

  if (!isMember) throw new ApiError("You are not a member of this team", 400);

  // Captain must transfer captaincy first
  if (team.manager.toString() === userId)
    throw new ApiError(
      "You must transfer captaincy before leaving the team",
      400,
    );

  team.members = team.members.filter((member) => member.toString() !== userId);

  await team.save();

  return team;
};

export const deleteTeam = async (userId: string, teamId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Only admin or manager can delete a team
  if (user.role !== "admin" && user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  const deletedTeam = await Teams.findByIdAndDelete(teamId);

  if (!deletedTeam) {
    throw new ApiError("Team not found", 404);
  }

  return deletedTeam;
};
