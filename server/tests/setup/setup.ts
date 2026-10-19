jest.setTimeout(30000);

import { connectDB, clearDB, closeDB } from "./database";

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});
