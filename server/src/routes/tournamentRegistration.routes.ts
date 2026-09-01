import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import ROLES from "../constants/ROLES";
import validate from "../middleware/validation.middleware";

import {
  tournamentRegistrationValidatorSchema,
  reviewTournamentRegistrationValidatorSchema,
} from "../validators/tournamentRegistration.validator";

import * as registrationController from "../controllers/teamRegistration.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tournament Registrations
 *   description: Tournament team registration and approval management
 */

/**
 * @swagger
 * /v1/tournament-registrations:
 *   post:
 *     summary: Apply a team to a tournament
 *     tags:
 *       - Tournament Registrations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournament
 *               - team
 *             properties:
 *               tournament:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *               team:
 *                 type: string
 *                 example: 65f123456789abcdef123457
 *     responses:
 *       201:
 *         description: Tournament application submitted successfully
 *       400:
 *         description: Invalid request or tournament registration is closed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only managers can apply teams
 *       404:
 *         description: Tournament, team or user not found
 *       409:
 *         description: Team already has an application
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.MANAGER),
  validate(tournamentRegistrationValidatorSchema),
  registrationController.applyTournament,
);

/**
 * @swagger
 * /v1/tournament-registrations/tournament/{tournamentId}:
 *   get:
 *     summary: Get tournament registration applications
 *     tags:
 *       - Tournament Registrations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - approved
 *             - rejected
 *         description: Filter applications by status
 *     responses:
 *       200:
 *         description: Tournament applications retrieved successfully
 *       400:
 *         description: Invalid tournament ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.get(
  "/tournament/:tournamentId",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  registrationController.findTournamentApplications,
);

/**
 * @swagger
 * /v1/tournament-registrations/{id}:
 *   get:
 *     summary: Get a tournament application by ID
 *     tags:
 *       - Tournament Registrations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament registration application ID
 *     responses:
 *       200:
 *         description: Tournament application retrieved successfully
 *       400:
 *         description: Invalid application ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tournament application not found
 */
router.get(
  "/:id",
  verifyJWT,
  registrationController.findTournamentApplicationById,
);

/**
 * @swagger
 * /v1/tournament-registrations/{id}/review:
 *   patch:
 *     summary: Approve or reject a tournament application
 *     tags:
 *       - Tournament Registrations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament application ID
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
 *                   - approved
 *                   - rejected
 *                 example: approved
 *               rejectionReason:
 *                 type: string
 *                 example: Team roster does not meet tournament requirements
 *     responses:
 *       200:
 *         description: Tournament application reviewed successfully
 *       400:
 *         description: Invalid request or tournament is full
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin or organizer can review applications
 *       404:
 *         description: Application or tournament not found
 *       409:
 *         description: Team is already registered
 */
router.patch(
  "/:id/review",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(reviewTournamentRegistrationValidatorSchema),
  registrationController.reviewTournamentApplication,
);

export default router;
