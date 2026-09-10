import { Document, Types } from "mongoose";

export type DisputeReason =
  | "match_result"
  | "player_eligibility"
  | "rule_violation"
  | "match_conduct"
  | "technical_issue"
  | "other";

export type DisputeStatus = "open" | "under-review" | "resolved" | "rejected";

export interface IDispute extends Document {
  match: Types.ObjectId;
  tournament: Types.ObjectId;
  raisedBy: Types.ObjectId;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
}
