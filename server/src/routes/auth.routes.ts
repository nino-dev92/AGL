import express from "express";
import validate from "../middleware/validation.middleware";
import {
  userValidationSchema,
  loginValidationSchema,
  forgotPasswordValidatorSchema,
  resetPasswordValidatorSchema,
} from "../validators/user.validator";
import * as authController from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimit.middleware";
import verifyJWT from "../middleware/verifyJWT.middleware";

const router = express.Router();

/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Richard
 *               lastName:
 *                 type: string
 *                 example: Nneji
 *               userName:
 *                 type: string
 *                 example: Italian92
 *               email:
 *                 type: string
 *                 example: richard@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               confirmPassword:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

router.post("/signup", validate(userValidationSchema), authController.signUp);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: richard@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post(
  "/login",
  authLimiter,
  validate(loginValidationSchema),
  authController.login,
);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/logout", authController.logout);

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */

router.post("/refresh", authController.refresh);

// Forgot password
/**
 * @swagger
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: Sends a password reset link to the user's email address if an account exists.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: player@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed successfully
 *       400:
 *         description: Invalid email
 */

router.post(
  "/forgot-password",
  validate(forgotPasswordValidatorSchema),
  authController.forgotPassword,
);

// Reset password
/**
 * @swagger
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets a user's password using a valid password reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received by email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New account password
 *                 example: NewSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 */

router.post(
  "/reset-password",
  validate(resetPasswordValidatorSchema),
  authController.resetPassword,
);

// Delete account
/**
 * @swagger
 * /v1/auth/account:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     description: Deactivates the authenticated user's account and invalidates their refresh token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

router.delete("/account", verifyJWT, authController.deleteAccount);

export default router;
