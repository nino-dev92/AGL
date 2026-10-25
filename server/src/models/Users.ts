import mongoose, { Document, Schema, model, Types } from "mongoose";
import bcrypt from "bcrypt";
import env from "../config/env";
import ApiError from "../utils/apiError";
import logger from "../logger/logger";

export interface Avatar {
  url: string;
  publicId: string;
}

export type UserRole = "player" | "admin" | "manager" | "organizer";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;

  avatar?: Avatar;

  bio?: string;
  region?: string;
  game?: Types.ObjectId;

  totalKills?: number | undefined;
  totalDeaths?: number | undefined;
  totalGames?: number | undefined;
  tourneysPlayed?: number | undefined;
  tourneysWon?: number | undefined;

  role: UserRole;

  refreshToken?: string | undefined;

  passwordResetToken?: string | undefined;
  passwordResetExpires?: Date | undefined;

  createdAt: Date;
  updatedAt: Date;
}

const avatarSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: avatarSchema,
      default: undefined,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    region: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    game: {
      type: mongoose.Types.ObjectId,
      ref: "Game",
      required: false,
    },

    role: {
      type: String,
      enum: ["player", "admin", "manager", "organizer"],
      default: "player",
    },

    totalKills: { type: Number, default: 0 },
    totalDeaths: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    tourneysPlayed: { type: Number, default: 0 },
    tourneysWon: { type: Number, default: 0 },

    passwordResetToken: {
      type: String,
      default: undefined,
    },

    passwordResetExpires: {
      type: Date,
      default: undefined,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const saltRounds = Number(env.BCRYPT_SALT_ROUNDS);

  if (!saltRounds) {
    throw new ApiError("Bcrypt salt rounds not found", 500);
  }

  try {
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    logger.error(error);
    throw error;
  }
});

export default model<IUser>("User", userSchema);
