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
 * /users/me:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: User not found
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
 *     summary: Update a user profile
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
 *     summary: Upload profile avatar
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
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *     summary: Delete profile avatar
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
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
 *     summary: Delete user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
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
