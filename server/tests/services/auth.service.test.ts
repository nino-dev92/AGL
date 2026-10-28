import crypto from "crypto";
import { Types } from "mongoose";
import Users from "../../src/models/Users";
import bcrypt from "bcrypt";

import {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "../../src/services/auth.service";

jest.mock("../../src/services/email.service", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("Auth Service", () => {
  const createUser = async () => {
    return Users.create({
      firstName: "John",
      lastName: "Doe",
      userName: `johndoe_${new Types.ObjectId()}`,
      email: `john_${new Types.ObjectId()}@example.com`,
      password: "Password123!",
      role: "player",
    });
  };

  describe("registerUser", () => {
    it("should register a new user", async () => {
      const userName = `newuser_${new Types.ObjectId()}`;
      const email = `${new Types.ObjectId()}@example.com`;

      const result = await registerUser({
        firstName: "Jane",
        lastName: "Doe",
        userName,
        email,
        password: "Password123!",
        role: "player",
      });

      expect(result).toBeDefined();
      expect(result.firstName).toBe("Jane");
      expect(result.lastName).toBe("Doe");
      expect(result.userName).toBe(userName.toLowerCase());
      expect(result.email).toBe(email.toLowerCase());
      expect(result.role).toBe("player");

      const user = await Users.findById(result.id).select("+password");

      expect(user).not.toBeNull();
      expect(user?.password).not.toBe("Password123!");
      expect(await bcrypt.compare("Password123!", user!.password)).toBe(true);
    });

    it("should normalize email and username to lowercase", async () => {
      const email = `${new Types.ObjectId()}@example.com`;
      const userName = `TestUser_${new Types.ObjectId()}`;

      const result = await registerUser({
        firstName: "Jane",
        lastName: "Doe",
        userName,
        email: email.toUpperCase(),
        password: "Password123!",
        role: "player",
      });

      expect(result.email).toBe(email.toLowerCase());
      expect(result.userName).toBe(userName.toLowerCase());
    });

    it("should register a manager without a game or region", async () => {
      const result = await registerUser({
        firstName: "Morgan",
        lastName: "Manager",
        userName: `manager_${new Types.ObjectId()}`,
        email: `${new Types.ObjectId()}@example.com`,
        password: "Password123!",
        role: "manager",
      });

      expect(result.role).toBe("manager");

      const user = await Users.findById(result.id);
      expect(user?.game).toBeUndefined();
      expect(user?.region).toBe("");
    });

    it("should reject an invalid role", async () => {
      await expect(
        registerUser({
          firstName: "Jane",
          lastName: "Doe",
          userName: "invalidroleuser",
          email: "invalidrole@example.com",
          password: "Password123!",
          role: "invalid-role" as any,
        }),
      ).rejects.toThrow("Invalid role");
    });

    it("should reject a duplicate email", async () => {
      const user = await createUser();

      await expect(
        registerUser({
          firstName: "Another",
          lastName: "User",
          userName: `another_${new Types.ObjectId()}`,
          email: user.email,
          password: "Password123!",
          role: "player",
        }),
      ).rejects.toThrow("Email already exists");
    });

    it("should reject a duplicate username", async () => {
      const user = await createUser();

      await expect(
        registerUser({
          firstName: "Another",
          lastName: "User",
          userName: user.userName,
          email: `${new Types.ObjectId()}@example.com`,
          password: "Password123!",
          role: "player",
        }),
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const user = await createUser();

      const result = await login({
        email: user.email,
        password: "Password123!",
      });

      expect(result.user.id).toBe(user._id.toString());
      expect(result.user.email).toBe(user.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      const updatedUser = await Users.findById(user._id).select(
        "+refreshToken",
      );

      expect(updatedUser?.refreshToken).toBe(result.refreshToken);
    });

    it("should reject an unknown email", async () => {
      await expect(
        login({
          email: "doesnotexist@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should reject an incorrect password", async () => {
      const user = await createUser();

      await expect(
        login({
          email: user.email,
          password: "WrongPassword123!",
        }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("should remove the user's refresh token", async () => {
      const user = await createUser();

      await login({
        email: user.email,
        password: "Password123!",
      });

      const loggedInUser = await Users.findById(user._id).select(
        "+refreshToken",
      );

      await logout(loggedInUser?.refreshToken);

      const updatedUser = await Users.findById(user._id).select(
        "+refreshToken",
      );

      expect(updatedUser?.refreshToken).toBe("");
    });

    it("should do nothing when no refresh token is provided", async () => {
      await expect(logout()).resolves.toBeUndefined();
    });
  });

  describe("forgotPassword", () => {
    it("should create a password reset token", async () => {
      const user = await createUser();

      await forgotPassword(user.email);

      const updatedUser = await Users.findById(user._id).select(
        "+passwordResetToken +passwordResetExpires",
      );

      expect(updatedUser?.passwordResetToken).toBeDefined();
      expect(updatedUser?.passwordResetExpires).toBeDefined();
      expect(updatedUser!.passwordResetExpires!.getTime()).toBeGreaterThan(
        Date.now(),
      );
    });

    it("should not throw when the email does not exist", async () => {
      await expect(
        forgotPassword("doesnotexist@example.com"),
      ).resolves.toBeUndefined();
    });
  });

  describe("resetPassword", () => {
    it("should reset the password with a valid token", async () => {
      const user = await createUser();

      const resetToken = "test-reset-token";

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      user.refreshToken = "old-refresh-token";

      await user.save();

      const result = await resetPassword(resetToken, "NewPassword123!");

      expect(result).toBe(true);

      const updatedUser = await Users.findById(user._id).select(
        "+password +passwordResetToken +passwordResetExpires +refreshToken",
      );

      expect(
        await bcrypt.compare("NewPassword123!", updatedUser!.password),
      ).toBe(true);

      expect(updatedUser?.passwordResetToken).toBeUndefined();
      expect(updatedUser?.passwordResetExpires).toBeUndefined();
      expect(updatedUser?.refreshToken).toBe("");
    });

    it("should reject an invalid reset token", async () => {
      await expect(
        resetPassword("invalid-token", "NewPassword123!"),
      ).rejects.toThrow("Invalid or expired password reset token");
    });
  });

  describe("deleteAccount", () => {
    it("should delete an existing user", async () => {
      const user = await createUser();

      const result = await deleteAccount(user._id.toString());

      expect(result).toBe(true);

      const deletedUser = await Users.findById(user._id);

      expect(deletedUser).toBeNull();
    });

    it("should reject an invalid user ID", async () => {
      await expect(deleteAccount("invalid-user-id")).rejects.toThrow(
        "Invalid user ID",
      );
    });

    it("should reject a user that does not exist", async () => {
      const userId = new Types.ObjectId().toString();

      await expect(deleteAccount(userId)).rejects.toThrow("User not found");
    });
  });
});
