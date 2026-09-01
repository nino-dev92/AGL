import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import ROLES from "../constants/ROLES";
import validate from "../middleware/validation.middleware";

import {
  matchValidatorSchema,
  updateMatchValidatorSchema,
} from "../validators/match.validator";

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
 * /v1/matches:
 *   get:
 *     summary: Get all matches
 *     description: Public endpoint for retrieving tournament matches.
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
 *         description: Filter matches involving a specific team
 *
 *       - in: query
 *         name: round
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter matches by tournament round
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
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of matches per page
 *
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 *       400:
 *         description: Invalid query parameter
 */
router.get("/", matchController.findAllMatches);

/**
 * @swagger
 * /v1/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     description: Public endpoint for retrieving a single match.
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
 *       400:
 *         description: Invalid match ID
 *       404:
 *         description: Match not found
 */
router.get("/:id", matchController.findMatchById);

/**
 * @swagger
 * /v1/matches:
 *   post:
 *     summary: Create a single match
 *     description: Create an individual tournament match manually.
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
 *                 minimum: 1
 *                 example: 1
 *
 *     responses:
 *       201:
 *         description: Match created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament or team not found
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
 * /v1/matches/{id}:
 *   patch:
 *     summary: Update a match
 *     description: Update the schedule, status, result, or winner of a match.
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
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - ongoing
 *                   - completed
 *                   - cancelled
 *                 example: ongoing
 *
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
 *         description: Match updated successfully
 *       400:
 *         description: Invalid match or update data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Match not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(updateMatchValidatorSchema),
  matchController.editMatch,
);

/**
 * @swagger
 * /v1/matches/{id}:
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
 *       400:
 *         description: Invalid match ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
