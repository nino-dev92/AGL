import express from "express";
import * as publicPlayerController from "../controllers/publicPlayer.controller";

const router = express.Router();

/**
 * @swagger
 * /v1/players:
 *   post:
 *     summary: Get all players
 *     tags:
 *       - Players
 *     responses:
 *       201:
 *         description: All players retrieved successfully
 */

router.get("/", publicPlayerController.getAllPlayers);

/**
 * @swagger
 * /v1/players/{username}:
 *   get:
 *     summary: Get a player
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *     responses:
 *       200:
 *         description: Player profile retrieved successfully
 *       404:
 *         description: Player not found
 */

router.get("/:username", publicPlayerController.getPublicPlayerProfile);

export default router;
