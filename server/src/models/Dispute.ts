import { Schema, model } from "mongoose";
import { IDispute, DisputeReason, DisputeStatus } from "../types/dispute.types";

const disputeSchema = new Schema<IDispute>(
  {
    match: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "match_result",
        "player_eligibility",
        "rule_violation",
        "match_conduct",
        "technical_issue",
        "other",
      ] satisfies DisputeReason[],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "open",
        "under-review",
        "resolved",
        "rejected",
      ] satisfies DisputeStatus[],
      default: "open",
    },

    resolution: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: false,
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    resolvedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

disputeSchema.index({ tournament: 1, status: 1 });
disputeSchema.index({ match: 1 });
disputeSchema.index({ raisedBy: 1 });

export default model<IDispute>("Dispute", disputeSchema);
