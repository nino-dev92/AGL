import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface IMatch extends Document {
  tournament: Types.ObjectId;
  teamA: Types.ObjectId;
  teamB: Types.ObjectId;
  scheduledDate: Date;
  status: "pending" | "ongoing" | "completed" | "cancelled";

  teamAScore?: number;
  teamBScore?: number;

  organizer: Types.ObjectId;

  result?: string | undefined;
  winner?: Types.ObjectId | undefined;
  round: string;
  matchNumber: number;
}

const matchSchema: Schema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    teamA: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    teamB: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    organizer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },

    teamAScore: {
      type: Number,
      min: 0,
      required: false,
    },

    teamBScore: {
      type: Number,
      min: 0,
      required: false,
    },

    result: {
      type: String,
      required: false,
      trim: true,
    },

    winner: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: false,
    },

    round: {
      type: String,
      required: true,
      trim: true,
    },

    matchNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Prevent duplicate match numbers within the same tournament round.
 *
 * Example:
 *
 * Tournament A
 *   Quarter Final - Match 1
 *   Quarter Final - Match 2
 *
 * The same tournament cannot have another
 * Quarter Final - Match 1.
 */
matchSchema.index(
  {
    tournament: 1,
    round: 1,
    matchNumber: 1,
  },
  {
    unique: true,
  },
);

export default model<IMatch>("Match", matchSchema);
