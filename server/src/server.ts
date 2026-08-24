import app from "./app";
import connectDB from "./config/db";
import logger from "./logger/logger";
import env from "./config/env";

const connect = async () => {
  const port = env.PORT ?? 5000;
  try {
    await connectDB();

    app.listen(port, () => logger.info(`App is listening on ${port}`));
  } catch (error: any) {
    logger.error(error);
    process.exit(1);
  }
};

connect();
