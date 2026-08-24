import mongoose from "mongoose";
import logger from "../logger/logger";
import env from "./env";

const connectDB = async () => {
  try {
    mongoose.connect(env.MONGO_URI, { dbName: "AGL" });
    logger.info("DB Connected");
  } catch (error: any) {
    logger.error(error);
  }
};

export default connectDB;
