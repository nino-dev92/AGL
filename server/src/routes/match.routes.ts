import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware";

import authorizeRole from "../middleware/authorizeRole.middleware";

import ROLES from "../constants/ROLES";

import validate from "../middleware/validation.middleware";

import {
  matchValidatorSchema,
  matchResultValidatorSchema,
  tournamentMatchesValidatorSchema,
} from "../validators/match.validator";

import * as matchChatController from "../controllers/matchChat.controller";

import * as matchController from "../controllers/match.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Tournament match management endpoints
 */

/**
 * @swagger
 * /v1/match:
 *   get:
 *     summary: Get all matches
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: query
 *         name: tournament
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter matches by tournament ID
 *
 *       - in: query
 *         name: team
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter matches by team ID
 *
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - ongoing
 *             - completed
 *             - cancelled
 *         description: Filter matches by status
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of matches per page
 *
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 */
router.get("/", matchController.findAllMatches);

/**
 * @swagger
 * /v1/match/chat-history/{id}:
 *   get:
 *     summary: Get match chat history
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Match chat history retrieved successfully
 */

router.get("/chat-history/:id", verifyJWT, matchChatController.getChatHistory);

/**
 * @swagger
 * /v1/match/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     responses:
 *       200:
 *         description: Match retrieved successfully
 *
 *       400:
 *         description: Invalid match ID
 *
 *       404:
 *         description: Match not found
 */
router.get("/:id", matchController.findMatchById);

/**
 * @swagger
 * /v1/match:
 *   post:
 *     summary: Create a new match
 *     tags:
 *       - Matches
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
 *               - tournament
 *               - teamA
 *               - teamB
 *               - scheduledDate
 *               - round
 *               - matchNumber
 *             properties:
 *               tournament:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *
 *               teamA:
 *                 type: string
 *                 example: 65f123456789abcdef123457
 *
 *               teamB:
 *                 type: string
 *                 example: 65f123456789abcdef123458
 *
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-20T15:00:00.000Z
 *
 *               round:
 *                 type: string
 *                 example: Quarter Final
 *
 *               matchNumber:
 *                 type: integer
 *                 example: 1
 *
 *     responses:
 *       201:
 *         description: Match created successfully
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
 *       404:
 *         description: User not found
 *
 *       409:
 *         description: Match already exists
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(matchValidatorSchema),
  matchController.addMatch,
);

/**
 * @swagger
 * /v1/match/tournament-matches:
 *   post:
 *     summary: Create a new match
 *     tags:
 *       - Matches
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
 *               - tournament
 *               - teamA
 *               - teamB
 *               - scheduledDate
 *               - round
 *               - matchNumber
 *             properties:
 *               tournament:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *
 *               teamA:
 *                 type: string
 *                 example: 65f123456789abcdef123457
 *
 *               teamB:
 *                 type: string
 *                 example: 65f123456789abcdef123458
 *
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-20T15:00:00.000Z
 *
 *               round:
 *                 type: string
 *                 example: Quarter Final
 *
 *               matchNumber:
 *                 type: integer
 *                 example: 1
 *
 *     responses:
 *       201:
 *         description: Match created successfully
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
 *       404:
 *         description: User not found
 *
 *       409:
 *         description: Match already exists
 */
router.post(
  "/tournament-matches",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(tournamentMatchesValidatorSchema),
  matchController.createTournamentMatches,
);

/**
 * @swagger
 * /v1/match/{id}:
 *   patch:
 *     summary: Update a match
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-20T18:00:00.000Z
 *
 *               round:
 *                 type: string
 *                 example: Semi Final
 *
 *               matchNumber:
 *                 type: integer
 *                 example: 2
 *
 *     responses:
 *       200:
 *         description: Match updated successfully
 *
 *       400:
 *         description: Invalid match ID
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Match not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  matchController.editMatch,
);

/**
 * @swagger
 * /v1/match/{id}/start:
 *   patch:
 *     summary: Start a match
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     responses:
 *       200:
 *         description: Match started successfully
 *
 *       400:
 *         description: Invalid match ID or match cannot be started
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Match not found
 */
router.patch(
  "/:id/start",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  matchController.startMatch,
);

/**
 * @swagger
 * /v1/match/{id}/result:
 *   patch:
 *     summary: Submit a match result
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result
 *               - winner
 *             properties:
 *               result:
 *                 type: string
 *                 example: 3-1
 *
 *               winner:
 *                 type: string
 *                 example: 65f123456789abcdef123457
 *
 *     responses:
 *       200:
 *         description: Match result submitted successfully
 *
 *       400:
 *         description: Invalid result, winner, or match status
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Match not found
 */
router.patch(
  "/:id/result",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(matchResultValidatorSchema),
  matchController.submitMatchResult,
);

/**
 * @swagger
 * /v1/match/{id}/cancel:
 *   patch:
 *     summary: Cancel a match
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     responses:
 *       200:
 *         description: Match cancelled successfully
 *
 *       400:
 *         description: Invalid match ID or match cannot be cancelled
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Match not found
 */
router.patch(
  "/:id/cancel",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  matchController.cancelMatch,
);

/**
 * @swagger
 * /v1/match/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags:
 *       - Matches
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *
 *       400:
 *         description: Invalid match ID
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Match not found
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  matchController.removeMatch,
);

export default router;
