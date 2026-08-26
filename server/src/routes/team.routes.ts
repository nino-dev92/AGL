import express from "express";

import authorizeRole from "../middleware/authorizeRole.middleware";
import verifyJWT from "../middleware/verifyJWT.middleware";
import ROLES from "../constants/ROLES";

import * as teamController from "../controllers/team.controller";

import teamValidationSchema from "../validators/team.validator";
import validate from "../middleware/validation.middleware";

import upload from "../middleware/upload.middleware";

const router = express.Router();

//PUBLIC ROUTES

/**
 * @swagger
 * /v1/teams:
 *   get:
 *     summary: Get all teams
 *     description: Retrieve a paginated list of all teams. This is a public route.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of teams per page
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search teams by name
 *       - in: query
 *         name: game
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter teams by game
 *     responses:
 *       200:
 *         description: All teams retrieved successfully
 */
router.get("/", teamController.findAllTeams);

/**
 * @swagger
 * /v1/teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     description: Retrieve a single team's details. This is a public route.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *       404:
 *         description: Team not found
 */

router.get("/:id", teamController.findTeambyId);

// ADMIN ROUTES

/**
 * @swagger
 * /v1/teams:
 *   post:
 *     summary: Create a new team
 *     description: Creates a new team and assigns an existing player as the captain.
 *     tags:
 *       - Teams
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
 *               - captain
 *               - game
 *               - maxMembers
 *             properties:
 *               name:
 *                 type: string
 *                 example: COD Professionals
 *               description:
 *                 type: string
 *                 example: A competitive Call of Duty team
 *               game:
 *                 type: string
 *                 example: Call of Duty
 *               captain:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *               maxMembers:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Invalid request or selected captain is not a player
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Team already exists
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  validate(teamValidationSchema),
  teamController.addTeam,
);

/**
 * @swagger
 * /v1/teams/{teamId}/captain:
 *   patch:
 *     summary: Change team captain
 *     description: Transfers captaincy to an existing member of the team. Only an admin can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newCaptainId
 *             properties:
 *               newCaptainId:
 *                 type: string
 *                 example: 65f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Captain changed successfully
 *       400:
 *         description: Selected user is not a team member or is already the captain
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or team not found
 */
router.patch(
  "/:teamId/captain",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  teamController.changeCaptain,
);

/**
 * @swagger
 * /v1/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     description: Permanently deletes a team. Only an admin can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  teamController.deleteTeam,
);

// ADMIN OR TEAM CAPTAIN ROUTES

/**
 * @swagger
 * /v1/teams/{id}:
 *   patch:
 *     summary: Update team details
 *     description: Updates a team's details. An admin or the captain of that specific team can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: COD Professionals
 *               description:
 *                 type: string
 *                 example: Updated team description
 *               game:
 *                 type: string
 *                 example: Call of Duty
 *               maxMembers:
 *                 type: number
 *                 example: 12
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.PLAYER),
  teamController.editTeam,
);

/**
 * @swagger
 * /v1/teams/{teamId}/logo:
 *   patch:
 *     summary: Upload or update team logo
 *     description: Uploads a new team logo or replaces the existing logo. Only an admin or the team's captain can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid image or no image uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or team not found
 */
router.patch(
  "/:teamId/logo",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.PLAYER),
  upload.single("logo"),
  teamController.updateTeamLogo,
);

/**
 * @swagger
 * /v1/teams/{teamId}/logo:
 *   delete:
 *     summary: Delete team logo
 *     description: Deletes the team's logo from Cloudinary and removes it from the database. Only an admin or the team's captain can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team logo deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User, team, or logo not found
 */
router.delete(
  "/:teamId/logo",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.PLAYER),
  teamController.deleteTeamLogo,
);

/**
 * @swagger
 * /v1/teams/{teamId}/members:
 *   patch:
 *     summary: Add members to a team
 *     description: Adds one or more players to a team. Only an admin or the captain of that team can perform this action.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 65f123456789abcdef123456
 *                   - 65f987654321abcdef123456
 *     responses:
 *       200:
 *         description: Members added successfully
 *       400:
 *         description: Invalid members, duplicate members, or team capacity exceeded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or team not found
 */
router.patch(
  "/:teamId/members",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.PLAYER),
  teamController.addTeamMember,
);

/**
 * @swagger
 * /v1/teams/{teamId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a team
 *     description: Removes a player from the team. Only an admin or the team's captain can perform this action. The current captain cannot be removed until captaincy is transferred.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team member ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Captaincy must be transferred before removing the captain
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User, team, or member not found
 */
router.delete(
  "/:teamId/members/:memberId",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.PLAYER),
  teamController.removeTeamMember,
);

// TEAM MEMBER ROUTES

/**
 * @swagger
 * /v1/teams/{teamId}/members/me:
 *   delete:
 *     summary: Leave a team
 *     description: Allows the authenticated player to leave a team. A captain must transfer captaincy before leaving.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Successfully left the team
 *       400:
 *         description: User is not a member or captaincy must be transferred first
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or team not found
 */
router.delete(
  "/:teamId/members/me",
  verifyJWT,
  authorizeRole(ROLES.PLAYER),
  teamController.leaveTeam,
);

export default router;
