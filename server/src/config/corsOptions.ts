import cors, { CorsOptions } from "cors";
import allowedOrigins from "./allowedOrigins";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log("Request origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
