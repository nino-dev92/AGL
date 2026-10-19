import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

export const connectDB = async () => {
  mongo = await MongoMemoryServer.create();

  await mongoose.connect(mongo.getUri());
};

export const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongo.stop();
};

export const clearDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
};
