import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});

const env = z.parse(envSchema, process.env);

export default env;
