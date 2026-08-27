import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import env from "../config/env";
import ApiError from "../utils/apiError";
import logger from "../logger/logger";

export interface Avatar {
  url: string;
  publicId: string;
}

export type UserRole = "player" | "admin" | "manager";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;

  avatar?: Avatar;

  bio?: string;
  country?: string;
  game?: string;
  playerRole?: string;

  role: UserRole;

  refreshToken?: string;

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

    country: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    game: {
      type: String,
      trim: true,
      default: "",
    },

    playerRole: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["player", "admin", "manager"],
      default: "player",
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
