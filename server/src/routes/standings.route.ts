import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.middleware";
import * as standingsController from "../controllers/standings.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Tournament standings endpoints
 */

/**
 * @swagger
 * /standings/{tournamentId}:
 *   get:
 *     summary: Get tournament standings
 *     description: Returns the standings for all registered teams in a tournament based on completed matches.
 *     tags:
 *       - Standings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the tournament
 *         example: 66c8a7f2e4b123456789abcd
 *     responses:
 *       200:
 *         description: Tournament standings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 66c8a7f2e4b123456789abcd
 *                       name:
 *                         type: string
 *                         example: Team Alpha
 *                       slug:
 *                         type: string
 *                         example: team-alpha
 *                       logo:
 *                         type: string
 *                         example: https://example.com/logo.png
 *                   mp:
 *                     type: integer
 *                     description: Matches played
 *                     example: 5
 *                   mw:
 *                     type: integer
 *                     description: Match wins / accumulated winning score
 *                     example: 12
 *                   ml:
 *                     type: integer
 *                     description: Match losses / accumulated losing score
 *                     example: 6
 *                   points:
 *                     type: integer
 *                     description: Total points
 *                     example: 12
 *
 *       400:
 *         description: Invalid tournament ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid tournament ID
 *
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *
 *       404:
 *         description: Tournament not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament not found
 *
 *       500:
 *         description: Internal server error
 */

router.get(
  "/:tournamentId",
  verifyJWT,
  standingsController.getTournamentStandings,
);

export default router;
