import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface ITournament extends Document {
  name: string;
  slug: string;
  description: string | undefined;
  game: Types.ObjectId;

  organizer: Types.ObjectId;

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

  status:
    | "upcoming"
    | "registration-open"
    | "registration-closed"
    | "ongoing"
    | "completed"
    | "cancelled";

  rules: string[];
}

const bannerSchema = new mongoose.Schema(
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

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 500,
    },

    game: {
      type: mongoose.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    organizer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    banner: {
      type: bannerSchema,
      default: undefined,
    },

    registeredTeams: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Team",
      },
    ],

    maxTeams: {
      type: Number,
      required: true,
      min: 2,
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "registration-open",
        "registration-closed",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "upcoming",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    rules: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default model<ITournament>("Tournament", tournamentSchema);
