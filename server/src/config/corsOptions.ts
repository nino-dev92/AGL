import allowedOrigins from "./allowedOrigins";

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allowed?: boolean) => void,
  ) => {
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  optionSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
