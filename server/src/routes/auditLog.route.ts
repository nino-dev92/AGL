import { Router } from "express";
import { getAuditLogsController } from "../controllers/auditLog.controller";
import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import ROLES from "../constants/ROLES";
import validate from "../middleware/validation.middleware";
import { getAuditLogsSchema } from "../validators/auditLog.validator";

const router = Router();

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: |
 *       Retrieve a paginated list of audit logs.
 *
 *       Only administrators can access audit logs.
 *       Results can be filtered by resource, action, or user.
 *     tags:
 *       - Audit Logs
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of audit logs per page
 *
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *           enum:
 *             - user
 *             - team
 *             - game
 *             - tournament
 *             - registration
 *             - match
 *             - dispute
 *             - announcement
 *             - notification
 *         description: Filter logs by resource type
 *
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum:
 *             - create
 *             - update
 *             - delete
 *             - approve
 *             - reject
 *             - start
 *             - complete
 *             - cancel
 *             - resolve
 *         description: Filter logs by action
 *
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: Filter audit logs by the user who performed the action
 *
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
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
 *                   example: Audit logs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f123456789abcdef123456
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f123456789abcdef123456
 *                           firstName:
 *                             type: string
 *                             example: Richard
 *                           lastName:
 *                             type: string
 *                             example: Nneji
 *                           userName:
 *                             type: string
 *                             example: richard
 *                           email:
 *                             type: string
 *                             example: admin@example.com
 *                           role:
 *                             type: string
 *                             example: admin
 *                       action:
 *                         type: string
 *                         enum:
 *                           - create
 *                           - update
 *                           - delete
 *                           - approve
 *                           - reject
 *                           - start
 *                           - complete
 *                           - cancel
 *                           - resolve
 *                       resource:
 *                         type: string
 *                         enum:
 *                           - user
 *                           - team
 *                           - game
 *                           - tournament
 *                           - registration
 *                           - match
 *                           - dispute
 *                           - announcement
 *                           - notification
 *                       resourceId:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         example: Created tournament 64f123456789abcdef123456
 *                       metadata:
 *                         type: object
 *                         additionalProperties: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *
 *       400:
 *         description: Invalid query parameters
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Only administrators can access audit logs
 */

router.get(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN),
  validate(getAuditLogsSchema),
  getAuditLogsController,
);

export default router;
