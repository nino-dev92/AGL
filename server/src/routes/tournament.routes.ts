import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import validate from "../middleware/validation.middleware";
import upload from "../middleware/upload.middleware";

import ROLES from "../constants/ROLES";

import * as tournamentController from "../controllers/tournament.controller";
import * as tournamentRegistrationController from "../controllers/tournamentRegistration.controller";
import { tournamentRegistrationSchema } from "../validators/tournamentRegistration.validator";
import { tournamentValidationSchema } from "../validators/tournament.validator";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Tournament management endpoints
 */

/**
 * @swagger
 * /v1/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags:
 *       - Tournaments
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tournaments by name
 *
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *         description: Filter tournaments by game ID
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *
 *     responses:
 *       200:
 *         description: Tournaments retrieved successfully
 */
router.get("/", tournamentController.findAllTournaments);

/**
 * @swagger
 * /v1/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - game
 *               - maxTeams
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lagos Gaming Championship
 *
 *               description:
 *                 type: string
 *                 example: Competitive gaming tournament
 *
 *               game:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *
 *               maxTeams:
 *                 type: integer
 *                 example: 16
 *
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-10T10:00:00.000Z
 *
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-15T18:00:00.000Z
 *
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - No cheating
 *                   - Teams must arrive on time
 *
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       409:
 *         description: Tournament already exists
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(tournamentValidationSchema),
  tournamentController.createTournament,
);

/**
 * @swagger
 * /v1/tournaments/{id}/banner:
 *   patch:
 *     summary: Upload or update tournament banner
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - banner
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Tournament banner uploaded successfully
 *
 *       400:
 *         description: Banner image is required
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Tournament not found
 */
router.patch(
  "/:id/banner",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  upload.single("banner"),
  tournamentController.updateTournamentBanner,
);

/**
 * @swagger
 * /v1/tournaments/{id}/banner:
 *   delete:
 *     summary: Delete tournament banner
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Tournament banner deleted successfully
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Tournament or banner not found
 */
router.delete(
  "/:id/banner",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  tournamentController.removeTournamentBanner,
);

/**
 * @swagger
 * /v1/tournaments/{id}/status:
 *   patch:
 *     summary: Change tournament status
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - upcoming
 *                   - registration-open
 *                   - registration-closed
 *                   - ongoing
 *                   - completed
 *                   - cancelled
 *                 example: registration-open
 *
 *     responses:
 *       200:
 *         description: Tournament status updated successfully
 *
 *       400:
 *         description: Invalid status or tournament ID
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Tournament not found
 */
router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  tournamentController.updateTournamentStatus,
);

/**
 * @swagger
 * /v1/tournaments/{id}/register:
 *   post:
 *     summary: Register a team for a tournament
 *     tags:
 *       - Tournament Registration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Team registered successfully
 *       400:
 *         description: Invalid request, registration closed, or tournament is full
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only the team captain can register the team
 *       404:
 *         description: Tournament, team, or user not found
 *       409:
 *         description: Team already registered
 */
router.post(
  "/:id/register",
  verifyJWT,
  validate(tournamentRegistrationSchema),
  tournamentRegistrationController.registerTeam,
);

/**
 * @swagger
 * /v1/tournaments/{id}/register:
 *   delete:
 *     summary: Withdraw a team from a tournament
 *     tags:
 *       - Tournament Registration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Team withdrawn successfully
 *       400:
 *         description: Registration is closed or invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only the team captain can withdraw the team
 *       404:
 *         description: Tournament, team, user, or registration not found
 */
router.delete(
  "/:id/register",
  verifyJWT,
  authorizeRole(ROLES.MANAGER, ROLES.ADMIN),
  validate(tournamentRegistrationSchema),
  tournamentRegistrationController.withdrawTeam,
);

/**
 * @swagger
 * /v1/tournaments/{id}/teams:
 *   get:
 *     summary: Get all teams registered for a tournament
 *     tags:
 *       - Tournament Registration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of teams per page
 *     responses:
 *       200:
 *         description: Registered teams retrieved successfully
 *       400:
 *         description: Invalid tournament ID
 *       404:
 *         description: Tournament not found
 */
router.get("/:id/teams", tournamentRegistrationController.getRegisteredTeams);

/**
 * @swagger
 * /v1/tournaments/{id}:
 *   get:
 *     summary: Get a tournament by ID
 *     tags:
 *       - Tournaments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Tournament retrieved successfully
 *
 *       400:
 *         description: Invalid tournament ID
 *
 *       404:
 *         description: Tournament not found
 */
router.get("/:id", tournamentController.findTournamentById);

/**
 * @swagger
 * /v1/tournaments/{id}:
 *   patch:
 *     summary: Update a tournament
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *
 *               description:
 *                 type: string
 *
 *               game:
 *                 type: string
 *
 *               maxTeams:
 *                 type: integer
 *
 *               startDate:
 *                 type: string
 *                 format: date-time
 *
 *               endDate:
 *                 type: string
 *                 format: date-time
 *
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *
 *       400:
 *         description: Invalid tournament ID
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Tournament not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  tournamentController.updateTournament,
);

/**
 * @swagger
 * /v1/tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament
 *     tags:
 *       - Tournaments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Tournament not found
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  tournamentController.removeTournament,
);

export default router;
