import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller";
import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import validate from "../middleware/validation.middleware";
import {
  createAnnouncementValidatorSchema,
  updateAnnouncementValidatorSchema,
} from "../validators/announcement.validator";
import ROLES from "../constants/ROLES";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Announcements endpoints
 */

/**
 * @swagger
 * /v1/announcements:
 *   post:
 *     summary: Create an announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tournament registration is now open
 *               content:
 *                 type: string
 *                 example: Registration for the upcoming AGL tournament is now open.
 *               type:
 *                 type: string
 *                 enum:
 *                   - general
 *                   - tournament
 *                   - match
 *                   - system
 *                 example: tournament
 *               tournament:
 *                 type: string
 *                 description: Tournament ID when the announcement is tournament-specific
 *                 example: 665abc123456789012345678
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole("admin", "organizer"),
  validate(createAnnouncementValidatorSchema),
  announcementController.createAnnouncement,
);

/**
 * @swagger
 * /v1/announcements:
 *   get:
 *     summary: Get published announcements
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - general
 *             - tournament
 *             - match
 *             - system
 *       - in: query
 *         name: tournament
 *         schema:
 *           type: string
 *         description: Filter announcements by tournament ID
 *     responses:
 *       200:
 *         description: Published announcements retrieved successfully
 */
router.get("/", announcementController.getAnnouncements);

/**
 * @swagger
 * /v1/announcements/{id}:
 *   get:
 *     summary: Get a published announcement by ID
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement retrieved successfully
 *       400:
 *         description: Invalid announcement ID
 *       404:
 *         description: Announcement not found
 */
router.get("/:id", announcementController.getAnnouncementById);

/**
 * @swagger
 * /v1/announcements/{id}:
 *   patch:
 *     summary: Update an announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated tournament announcement
 *               content:
 *                 type: string
 *                 example: The tournament schedule has been updated.
 *               type:
 *                 type: string
 *                 enum:
 *                   - general
 *                   - tournament
 *                   - match
 *                   - system
 *               tournament:
 *                 type: string
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(updateAnnouncementValidatorSchema),
  announcementController.updateAnnouncement,
);

/**
 * @swagger
 * /v1/announcements/{id}/publish:
 *   patch:
 *     summary: Publish an announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement published successfully
 *       400:
 *         description: Invalid request or announcement already published
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.patch(
  "/:id/publish",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  announcementController.publishAnnouncement,
);

/**
 * @swagger
 * /v1/announcements/{id}/unpublish:
 *   patch:
 *     summary: Unpublish an announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement unpublished successfully
 *       400:
 *         description: Invalid request or announcement already unpublished
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.patch(
  "/:id/unpublish",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  announcementController.unpublishAnnouncement,
);

/**
 * @swagger
 * /v1/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       400:
 *         description: Invalid announcement ID
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  announcementController.deleteAnnouncement,
);

export default router;
