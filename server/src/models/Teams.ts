import mongoose, { Document, Schema, Types, model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  slug: string;
  description: string;
  game: string;
  captain: Types.ObjectId;
  members: Types.ObjectId[];
  maxMembers: number;
  logo?: {
    url: string;
    publicId: string;
  };
  isActive: boolean;
}

const logoSchema = new Schema(
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

const teamSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    game: { type: String, required: true },
    captain: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    maxMembers: { type: Number, required: true },
    logo: { type: logoSchema, default: undefined },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<ITeam>("Team", teamSchema);
