import mongoose, { Document, model, Schema, Types } from "mongoose";
import type { Status } from "../types/tournament.types";

export interface ITournament extends Document {
  name: string;
  slug: string;
  description: string | undefined;
  game: Types.ObjectId;
  banner?:
    | {
        url: string;
        publicId: string;
      }
    | undefined;
  registeredTeams: Types.ObjectId[];
  maxTeams: number;
  startDate: Date;
  endDate: Date;
  status: Status;
  rules: string[];
}

const bannerSchema = {};

const tournamentSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 50,
    },
    slug: { type: String, required: true, unique: true },
    description: { type: String, trim: true, minLength: 3, maxLength: 50 },
    game: { type: mongoose.Types.ObjectId, ref: "Game", required: true },
    banner: { type: bannerSchema },
    registeredTeams: [{ type: mongoose.Types.ObjectId, ref: "Team" }],
    maxTeams: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
        "registration-open",
        "registration-closed",
      ],
      default: "upcoming",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rules: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default model<ITournament>("Tournament", tournamentSchema);
