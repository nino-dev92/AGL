import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import * as disputeController from "../controllers/dispute.controller";
import validate from "../middleware/validation.middleware";
import ROLES from "../constants/ROLES";

import {
  createDisputeValidatorSchema,
  resolveDisputeValidatorSchema,
} from "../validators/dispute.validator";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Disputes
 *   description: Dispute management endpoints
 */

/**
 * @swagger
 * /v1/disputes:
 *   get:
 *     summary: Get all disputes
 *     description: Returns a list of all disputes. Only administrators can access this endpoint.
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dispute'
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  disputeController.getAllDisputes,
);

/**
 * @swagger
 * /v1/disputes/{id}:
 *   get:
 *     summary: Get a dispute by ID
 *     description: Returns the details of a specific dispute. Only administrators can access this endpoint.
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the dispute
 *         example: 64f123abc456789def012345
 *     responses:
 *       200:
 *         description: Dispute retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dispute'
 *       400:
 *         description: Invalid dispute ID
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Dispute not found
 */
router.get(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  disputeController.getDisputeById,
);

/**
 * @swagger
 * /v1/disputes:
 *   post:
 *     summary: Create a dispute
 *     description: Creates a new dispute for a match or related issue. Players, managers, and organizers can create disputes.
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource or match the dispute relates to
 *         example: 64f123abc456789def012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - match
 *               - tournament
 *               - reason
 *               - description
 *             properties:
 *               match:
 *                 type: string
 *                 example: 64f123abc456789def012345
 *               tournament:
 *                 type: string
 *                 example: 64f123abc456789def012345
 *               reason:
 *                 type: string
 *                 example: shooter was cheating
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   dispute: 'dispute array'
 *       400:
 *         description: Validation error or invalid request
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Player, manager, or organizer role required
 *       404:
 *         description: Match or resource not found
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.PLAYER, ROLES.MANAGER, ROLES.ORGANIZER),
  validate(createDisputeValidatorSchema),
  disputeController.createDispute,
);

/**
 * @swagger
 * /v1/disputes/resolve/{id}:
 *   post:
 *     summary: Resolve a dispute
 *     description: Resolves an existing dispute. Only administrators can resolve disputes.
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the dispute to resolve
 *         example: 64f123abc456789def012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - resolution
 *             properties:
 *               status:
 *                 type: string
 *                 example: resolved
 *               resolution:
 *                 type: string
 *                 example: Team A cheated
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   dispute: 'dispute object'
 *       400:
 *         description: Validation error or invalid request
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Dispute not found
 */
router.post(
  "/resolve/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  validate(resolveDisputeValidatorSchema),
  disputeController.resolveDispute,
);

export default router;
