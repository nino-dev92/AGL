import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITournamentRegistration extends Document {
  tournament: Types.ObjectId;
  team: Types.ObjectId;
  manager: Types.ObjectId;

  status: "pending" | "approved" | "rejected";

  reviewedBy?: Types.ObjectId | undefined;
  reviewedAt?: Date | undefined;

  rejectionReason?: string | undefined;
}

const tournamentRegistrationSchema: Schema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    team: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    manager: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },

    reviewedAt: {
      type: Date,
      required: false,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 200,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// A team should not be able to submit multiple applications for the same tournament.
tournamentRegistrationSchema.index(
  {
    tournament: 1,
    team: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<ITournamentRegistration>(
  "TournamentRegistration",
  tournamentRegistrationSchema,
);
