import express from "express";
import authorizeRole from "../middleware/authorizeRole.middleware";
import verifyJWT from "../middleware/verifyJWT.middleware";
import ROLES from "../constants/ROLES";
import * as playerProfileController from "../controllers/playerProfile.controller";
import validate from "../middleware/validation.middleware";
import { playerProfileValidator } from "../validators/user.validator";
import upload from "../middleware/upload.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile
 *     description: Get the profile of the currently authenticated player.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f123abc456789def012345
 *                     bio:
 *                       type: string
 *                       example: COD multiplayer professional
 *                     country:
 *                       type: string
 *                       example: Nigeria
 *                     game:
 *                       type: string
 *                       example: C.O.D
 *                     playerRole:
 *                       type: string
 *                       example: leader
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player role required
 *       404:
 *         description: User profile not found
 */
router.get(
  "/me",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  playerProfileController.getMyProfile,
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update my profile
 *     description: Update the profile of the currently authenticated player.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: COD multiplayer professional
 *               country:
 *                 type: string
 *                 example: Nigeria
 *               game:
 *                 type: string
 *                 example: C.O.D
 *               playerRole:
 *                 type: string
 *                 example: leader
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player role required
 *       404:
 *         description: User profile not found
 */
router.patch(
  "/me",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  validate(playerProfileValidator),
  playerProfileController.updateProfile,
);

/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: Upload my profile avatar
 *     description: Upload a new profile avatar for the currently authenticated player.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile avatar image
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid or missing avatar file
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player role required
 *       404:
 *         description: User profile not found
 */
router.patch(
  "/me/avatar",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  upload.single("avatar"),
  playerProfileController.uploadAvatar,
);

/**
 * @swagger
 * /users/me/avatar:
 *   delete:
 *     summary: Delete my profile avatar
 *     description: Delete the profile avatar of the currently authenticated player.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar deleted successfully
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player role required
 *       404:
 *         description: User profile not found
 */
router.delete(
  "/me/avatar",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  playerProfileController.deleteAvatar,
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete my profile
 *     description: Delete the profile of the currently authenticated player.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile deleted successfully
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player role required
 *       404:
 *         description: User profile not found
 */
router.delete(
  "/me",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  playerProfileController.deleteProfile,
);

export default router;
