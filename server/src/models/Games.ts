import mongoose, { Document, Schema, model, Types } from "mongoose";

export interface IGame extends Document {
  name: string;
  category: Types.ObjectId;
  picture?:
    | {
        url: string;
        publicId: string;
      }
    | undefined;
}

const pictureSchema = new mongoose.Schema(
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

const gameSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    picture: { type: pictureSchema, default: undefined },
  },
  {
    timestamps: true,
  },
);

export default model<IGame>("Game", gameSchema);
