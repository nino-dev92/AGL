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
import categoryRoutes from "./routes/category.routes";
import tournamentRoutes from "./routes/tournament.routes";
import tournamentRegistrationRoutes from "./routes/tournamentRegistration.routes";
import matchRoutes from "./routes/match.routes";
import standingsRoutes from "./routes/standings.route";
import disputeRoutes from "./routes/dispute.routes";
import announcementRoutes from "./routes/announcement.routes";
import notificationRoutes from "./routes/notification.routes";
import auditLogRoutes from "./routes/auditLog.route";

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
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/tournament-registration", tournamentRegistrationRoutes);
app.use("/api/v1/match", matchRoutes);
app.use("/api/v1/standings", standingsRoutes);
app.use("/api/v1/disputes", disputeRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/audit-log", auditLogRoutes);

app.use(errorMiddleware);

export default app;
