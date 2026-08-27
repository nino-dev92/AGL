import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
dotenv.config({ debug: true });

import errorMiddleware from "./middleware/errorHandler.middleware";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/playerProfile.routes";
import publicPlayerRoutes from "./routes/publicPlayer.routes";
import teamRoutes from "./routes/team.routes";
import gameRoutes from "./routes/game.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/players", publicPlayerRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/games", gameRoutes);

app.use(errorMiddleware);

export default app;
