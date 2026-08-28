import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface IMatch extends Document {
  tournament: Types.ObjectId;
  teamA: Types.ObjectId;
  teamB: Types.ObjectId;
  scheduledDate: Date;
  status: "pending" | "ongoing" | "completed" | "cancelled";
  result?: string | undefined;
  winner?: Types.ObjectId | undefined;
  round: string;
}

const matchSchema: Schema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teamA: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    result: { type: String, required: false },
    winner: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: false,
    },
    round: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default model<IMatch>("Match", matchSchema);
