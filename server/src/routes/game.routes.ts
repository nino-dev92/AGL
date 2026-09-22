import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import ROLES from "../constants/ROLES";
import validate from "../middleware/validation.middleware";
import upload from "../middleware/upload.middleware";

import gameValidationSchema from "../validators/game.validator";

import * as gameController from "../controllers/game.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all games
 *     tags:
 *       - Games
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search games by name
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
 *         description: Number of games per page
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 */
router.get("/", gameController.findGame);

/**
 * @swagger
 * /v1/games/{id}:
 *   get:
 *     summary: Get a game by ID
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game retrieved successfully
 *       400:
 *         description: Invalid game ID
 *       404:
 *         description: Game not found
 */
router.get("/:id", gameController.findGameById);

/**
 * @swagger
 * /v1/games/:
 *   post:
 *     summary: Create a new game
 *     tags:
 *       - Games
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Call of Duty
 *               category:
 *                 type: string
 *                 example: Shooter
 *     responses:
 *       201:
 *         description: Game created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Game already exists
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(gameValidationSchema),
  gameController.addNewGame,
);

/**
 * @swagger
 * /v1/games/{id}:
 *   patch:
 *     summary: Update a game
 *     tags:
 *       - Games
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Call of Duty Mobile
 *               category:
 *                 type: string
 *                 example: Shooter
 *     responses:
 *       200:
 *         description: Game updated successfully
 *       400:
 *         description: Invalid game ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  gameController.updateGame,
);

/**
 * @swagger
 * /v1/games/{id}/picture:
 *   patch:
 *     summary: Upload or update game picture
 *     tags:
 *       - Games
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - picture
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 *       400:
 *         description: Invalid request or no image uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 */
router.patch(
  "/:id/picture",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  upload.single("picture"),
  gameController.updateGamePicture,
);

/**
 * @swagger
 * /v1/games/{id}/picture:
 *   delete:
 *     summary: Delete game picture
 *     tags:
 *       - Games
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game picture deleted successfully
 *       400:
 *         description: Invalid game ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game or picture not found
 */
router.delete(
  "/:id/picture",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  gameController.deleteGamePicture,
);

/**
 * @swagger
 * /v1/games/{id}:
 *   delete:
 *     summary: Delete a game
 *     tags:
 *       - Games
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game deleted successfully
 *       400:
 *         description: Invalid game ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  gameController.removeGame,
);

export default router;
