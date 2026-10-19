import { Types } from "mongoose";
import AuditLog from "../../src/models/AuditLog";
import Users from "../../src/models/Users";
import {
  createAuditLog,
  getAuditLogs,
} from "../../src/services/auditLog.service";

const createTestUser = async () => {
  const user = await Users.create({
    firstName: "Test",
    lastName: "User",
    userName: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: "Password123!",
    role: "player",
  });

  return user;
};

describe("Audit Log Service", () => {
  describe("createAuditLog", () => {
    it("should create an audit log successfully", async () => {
      const user = await createTestUser();

      await AuditLog.create([
        {
          user: user._id,
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        },
        {
          user: user._id,
          action: "update",
          resource: "match",
          description: "Updated match",
        },
      ]);

      const auditLog = await createAuditLog({
        user: user._id.toString(),
        action: "create",
        resource: "tournament",
        description: "Created tournament",
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.user.toString()).toBe(user._id.toString());
      expect(auditLog.action).toBe("create");
      expect(auditLog.resource).toBe("tournament");
      expect(auditLog.description).toBe("Created tournament");
    });

    it("should create an audit log with resourceId and metadata", async () => {
      const userId = new Types.ObjectId().toString();
      const resourceId = new Types.ObjectId().toString();

      const auditLog = await createAuditLog({
        user: userId,
        action: "update",
        resource: "match",
        resourceId,
        description: "Updated match",
        metadata: {
          teamAScore: 2,
          teamBScore: 1,
        },
      });

      expect(auditLog.user.toString()).toBe(userId);
      expect(auditLog.resourceId?.toString()).toBe(resourceId);
      expect(auditLog.metadata).toEqual({
        teamAScore: 2,
        teamBScore: 1,
      });
    });

    it("should reject an invalid user ID", async () => {
      await expect(
        createAuditLog({
          user: "invalid-user-id",
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid resource ID", async () => {
      await expect(
        createAuditLog({
          user: new Types.ObjectId().toString(),
          action: "update",
          resource: "match",
          resourceId: "invalid-resource-id",
          description: "Updated match",
        }),
      ).rejects.toThrow("Invalid resource ID");
    });
  });

  describe("getAuditLogs", () => {
    it("should retrieve audit logs", async () => {
      const userId = new Types.ObjectId();

      await AuditLog.create([
        {
          user: userId,
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        },
        {
          user: userId,
          action: "update",
          resource: "match",
          description: "Updated match",
        },
      ]);

      const result = await getAuditLogs();

      expect(result.logs).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("should filter logs by resource", async () => {
      const userId = new Types.ObjectId();

      await AuditLog.create([
        {
          user: userId,
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        },
        {
          user: userId,
          action: "update",
          resource: "match",
          description: "Updated match",
        },
      ]);

      const result = await getAuditLogs(1, 20, "match");

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]?.resource).toBe("match");
      expect(result.pagination.total).toBe(1);
    });

    it("should filter logs by action", async () => {
      const userId = new Types.ObjectId();

      await AuditLog.create([
        {
          user: userId,
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        },
        {
          user: userId,
          action: "update",
          resource: "match",
          description: "Updated match",
        },
      ]);

      const result = await getAuditLogs(1, 20, undefined, "create");

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]?.action).toBe("create");
    });

    it("should filter logs by user", async () => {
      const userId = new Types.ObjectId();
      const anotherUserId = new Types.ObjectId();

      await Users.create([
        {
          _id: userId,
          firstName: "Test",
          lastName: "User",
          userName: "testuser",
          email: "testuser@example.com",
          password: "Password123!",
          role: "admin",
        },
        {
          _id: anotherUserId,
          firstName: "Another",
          lastName: "User",
          userName: "anotheruser",
          email: "anotheruser@example.com",
          password: "Password123!",
          role: "admin",
        },
      ]);

      await AuditLog.create([
        {
          user: userId,
          action: "create",
          resource: "tournament",
          description: "Created tournament",
        },
        {
          user: anotherUserId,
          action: "delete",
          resource: "match",
          description: "Deleted match",
        },
      ]);

      const result = await getAuditLogs(
        1,
        20,
        undefined,
        undefined,
        userId.toString(),
      );

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]?.user).toBeDefined();
      expect(result.logs[0]?.user._id.toString()).toBe(userId.toString());
    });

    it("should correct a page smaller than 1", async () => {
      const result = await getAuditLogs(0);

      expect(result.pagination.page).toBe(1);
    });

    it("should reset an invalid limit to 20", async () => {
      const result = await getAuditLogs(1, 101);

      expect(result.pagination.limit).toBe(20);
    });

    it("should reject an invalid user filter", async () => {
      await expect(
        getAuditLogs(1, 20, undefined, undefined, "invalid-user-id"),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should paginate audit logs", async () => {
      const userId = new Types.ObjectId();

      await AuditLog.insertMany(
        Array.from({ length: 25 }, (_, index) => ({
          user: userId,
          action: "create" as const,
          resource: "tournament" as const,
          description: `Created tournament ${index}`,
        })),
      );

      const result = await getAuditLogs(2, 10);

      expect(result.logs).toHaveLength(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });
  });
});
