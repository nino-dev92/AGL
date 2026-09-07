import mongoose, { Document, Schema, Types, model } from "mongoose";

export interface IMatchChatMessage extends Document {
  match: Types.ObjectId;
  sender: Types.ObjectId;
  message: string;
  createdAt: Date;
}

const matchChatMessageSchema: Schema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

matchChatMessageSchema.index({
  match: 1,
  createdAt: 1,
});

export default model<IMatchChatMessage>(
  "MatchChatMessage",
  matchChatMessageSchema,
);
