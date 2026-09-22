import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware";
import authorizeRole from "../middleware/authorizeRole.middleware";
import validate from "../middleware/validation.middleware";

import ROLES from "../constants/ROLES";

import * as categoryController from "../controllers/category.controller";

import {
  categoryValidationSchema,
  updateCategoryValidationSchema,
  categoryStatusValidationSchema,
} from "../validators/category.validator";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Game category endpoints
 */

/**
 * @swagger
 * /v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search categories by name
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
 *           maximum: 50
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/", categoryController.findAllCategories);

/**
 * @swagger
 * /v1/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 */
router.get("/:id", categoryController.findCategoryById);

// Admin and Manager routes

/**
 * @swagger
 * /v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Categories
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: shooter
 *               description:
 *                 type: string
 *                 example: Games focused on shooting and combat
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Category already exists
 */
router.post(
  "/",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(categoryValidationSchema),
  categoryController.addCategory,
);

/**
 * @swagger
 * /v1/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: action
 *               description:
 *                 type: string
 *                 example: Games involving action and combat
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid request or category ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 */
router.patch(
  "/:id",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(updateCategoryValidationSchema),
  categoryController.updateCategory,
);

/**
 * @swagger
 * /v1/categories/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a category
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Category status updated successfully
 *       400:
 *         description: Invalid request or category ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.patch(
  "/:id/status",
  verifyJWT,
  authorizeRole(ROLES.ADMIN, ROLES.ORGANIZER),
  validate(categoryStatusValidationSchema),
  categoryController.updateCategoryStatus,
);

export default router;
