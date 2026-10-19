import { Types } from "mongoose";
import Users from "../../src/models/Users";
import Teams from "../../src/models/Teams";
import Games from "../../src/models/Games";
import Categories from "../../src/models/Category";

jest.mock("../../src/utils/validateImage", () => ({
  validateImageBuffer: jest.fn(),
}));

import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  addTeamMember,
  deleteTeamMember,
  leaveTeam,
  deleteTeam,
} from "../../src/services/team.service";

describe("Team Service", () => {
  const createUser = async (
    role: "player" | "admin" | "manager" | "organizer" = "player",
  ) => {
    const id = new Types.ObjectId().toString();

    return Users.create({
      firstName: "Test",
      lastName: "User",
      userName: `user${id}`,
      email: `user${id}@example.com`,
      password: "Password123!",
      role,
    });
  };

  const createGame = async () => {
    const id = new Types.ObjectId().toString();

    const category = await Categories.create({
      name: `Test Category ${id}`,
      description: "Test category",
    });

    return Games.create({
      name: `Test Game ${id}`,
      category: category._id,
    });
  };

  const createExistingTeam = async (
    managerId: Types.ObjectId,
    gameId: Types.ObjectId,
    options?: {
      name?: string;
      members?: Types.ObjectId[];
      maxMembers?: number;
    },
  ) => {
    const name =
      options?.name ?? `Test Team ${new Types.ObjectId().toString()}`;

    return Teams.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: "Test team",
      manager: managerId,
      members: options?.members ?? [],
      game: gameId,
      maxMembers: options?.maxMembers ?? 5,
      isActive: true,
    });
  };

  // =========================================================
  // createTeam
  // =========================================================

  describe("createTeam", () => {
    it("should reject an invalid user ID", async () => {
      const game = await createGame();

      await expect(
        createTeam("invalid-user-id", {
          name: "Test Team",
          description: "Test team",
          manager: new Types.ObjectId().toString(),
          captain: new Types.ObjectId().toString(),
          game: game._id.toString(),
          maxMembers: 5,
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject a user that does not exist", async () => {
      const game = await createGame();
      const userId = new Types.ObjectId().toString();

      await expect(
        createTeam(userId, {
          name: "Test Team",
          description: "Test team",
          manager: userId,
          captain: new Types.ObjectId().toString(),
          game: game._id.toString(),
          maxMembers: 5,
        }),
      ).rejects.toThrow("User not found");
    });

    it("should reject a user who is not a manager", async () => {
      const player = await createUser("player");
      const game = await createGame();

      await expect(
        createTeam(player._id.toString(), {
          name: "Test Team",
          description: "Test team",
          manager: player._id.toString(),
          captain: new Types.ObjectId().toString(),
          game: game._id.toString(),
          maxMembers: 5,
        }),
      ).rejects.toThrow("Team creator must be a manager");
    });

    it("should create a team successfully", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createTeam(manager._id.toString(), {
        name: "Test Team",
        description: "A test team",
        manager: manager._id.toString(),
        captain: new Types.ObjectId().toString(),
        game: game._id.toString(),
        maxMembers: 5,
      });

      expect(team).toBeDefined();
      expect(team.name).toBe("Test Team");
      expect(team.slug).toBe("test-team");
      expect(team.manager.toString()).toBe(manager._id.toString());
      expect(team.game.toString()).toBe(game._id.toString());
      expect(team.members).toHaveLength(0);
      expect(team.maxMembers).toBe(5);
    });

    it("should trim the team name", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createTeam(manager._id.toString(), {
        name: "   Test Team   ",
        description: "Test team",
        manager: manager._id.toString(),
        captain: new Types.ObjectId().toString(),
        game: game._id.toString(),
        maxMembers: 5,
      });

      expect(team.name).toBe("Test Team");
      expect(team.slug).toBe("test-team");
    });

    it("should reject a duplicate team name", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      await createTeam(manager._id.toString(), {
        name: "Duplicate Team",
        description: "First team",
        manager: manager._id.toString(),
        captain: new Types.ObjectId().toString(),
        game: game._id.toString(),
        maxMembers: 5,
      });

      await expect(
        createTeam(manager._id.toString(), {
          name: "Duplicate Team",
          description: "Second team",
          manager: manager._id.toString(),
          captain: new Types.ObjectId().toString(),
          game: game._id.toString(),
          maxMembers: 5,
        }),
      ).rejects.toThrow("Team name already exists");
    });

    it("should reject a duplicate team name regardless of case", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      await createTeam(manager._id.toString(), {
        name: "My Team",
        description: "First team",
        manager: manager._id.toString(),
        captain: new Types.ObjectId().toString(),
        game: game._id.toString(),
        maxMembers: 5,
      });

      await expect(
        createTeam(manager._id.toString(), {
          name: "my team",
          description: "Second team",
          manager: manager._id.toString(),
          captain: new Types.ObjectId().toString(),
          game: game._id.toString(),
          maxMembers: 5,
        }),
      ).rejects.toThrow("Team name already exists");
    });
  });

  // =========================================================
  // getAllTeams
  // =========================================================

  describe("getAllTeams", () => {
    it("should retrieve all teams", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      await createExistingTeam(manager._id, game._id, {
        name: "Alpha Team",
      });

      await createExistingTeam(manager._id, game._id, {
        name: "Beta Team",
      });

      const result = await getAllTeams("", 1, 20, "");

      expect(result.teams).toHaveLength(2);
      expect(result.totalTeams).toBe(2);
    });

    it("should search teams by name", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      await createExistingTeam(manager._id, game._id, {
        name: "Alpha Team",
      });

      await createExistingTeam(manager._id, game._id, {
        name: "Beta Team",
      });

      const result = await getAllTeams("Alpha", 1, 20, "");

      expect(result.teams).toHaveLength(1);
      expect(result.teams[0]?.name).toBe("Alpha Team");
      expect(result.totalTeams).toBe(1);
    });

    it("should filter teams by game", async () => {
      const manager = await createUser("manager");

      const game = await createGame();

      await createTeam(manager._id.toString(), {
        name: "Game Team",
        manager: manager._id.toString(),
        captain: manager._id.toString(),
        game: game._id.toString(),
        maxMembers: 5,
      });

      const result = await getAllTeams("", 1, 10, game._id.toString());

      expect(result.teams).toHaveLength(1);
      expect(result.teams[0]?.game.toString()).toBe(game._id.toString());
    });

    it("should paginate teams", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      for (let i = 1; i <= 15; i++) {
        await createExistingTeam(manager._id, game._id, {
          name: `Team ${i}`,
        });
      }

      const result = await getAllTeams("", 2, 5, "");

      expect(result.teams).toHaveLength(5);
      expect(result.totalTeams).toBe(15);
    });
  });

  // =========================================================
  // getTeamById
  // =========================================================

  describe("getTeamById", () => {
    it("should reject an invalid team ID", async () => {
      await expect(getTeamById("invalid-team-id")).rejects.toThrow(
        "Invalid team ID",
      );
    });

    it("should reject a team that does not exist", async () => {
      await expect(
        getTeamById(new Types.ObjectId().toString()),
      ).rejects.toThrow("Team not found");
    });

    it("should retrieve a team successfully", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      const result = await getTeamById(team._id.toString());

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(team._id.toString());
      expect(result.name).toBe(team.name);
    });
  });

  // =========================================================
  // updateTeam
  // =========================================================

  describe("updateTeam", () => {
    it("should reject an invalid user ID", async () => {
      await expect(
        updateTeam("invalid-user-id", new Types.ObjectId().toString(), {
          name: "Updated Team",
          maxMembers: 6,
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid team ID", async () => {
      const manager = await createUser("manager");

      await expect(
        updateTeam(manager._id.toString(), "invalid-team-id", {
          name: "Updated Team",
          maxMembers: 6,
        }),
      ).rejects.toThrow("Invalid team ID");
    });

    it("should reject a user that does not exist", async () => {
      await expect(
        updateTeam(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
          {
            name: "Updated Team",
            maxMembers: 6,
          },
        ),
      ).rejects.toThrow("User not found");
    });

    it("should reject a team that does not exist", async () => {
      const manager = await createUser("manager");

      await expect(
        updateTeam(manager._id.toString(), new Types.ObjectId().toString(), {
          name: "Updated Team",
          maxMembers: 6,
        }),
      ).rejects.toThrow("Team not found");
    });

    it("should update a team successfully", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      const updated = await updateTeam(
        manager._id.toString(),
        team._id.toString(),
        {
          name: "Updated Team",
          maxMembers: 8,
        },
      );

      expect(updated.name).toBe("Updated Team");
      expect(updated.slug).toBe("updated-team");
      expect(updated.maxMembers).toBe(8);
    });

    it("should reject reducing maxMembers below current membership", async () => {
      const manager = await createUser("manager");
      const memberOne = await createUser("player");
      const memberTwo = await createUser("player");
      const memberThree = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [memberOne._id, memberTwo._id, memberThree._id],
        maxMembers: 5,
      });

      await expect(
        updateTeam(manager._id.toString(), team._id.toString(), {
          maxMembers: 2,
        }),
      ).rejects.toThrow(
        "Maximum members cannot be less than the current number of team members",
      );
    });

    it("should reject a duplicate team name when updating", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      await createExistingTeam(manager._id, game._id, {
        name: "Existing Team",
      });

      const team = await createExistingTeam(manager._id, game._id, {
        name: "Another Team",
      });

      await expect(
        updateTeam(manager._id.toString(), team._id.toString(), {
          name: "Existing Team",
          maxMembers: 5,
        }),
      ).rejects.toThrow("Team name already exists");
    });
  });

  // =========================================================
  // addTeamMember
  // =========================================================

  describe("addTeamMember", () => {
    it("should add a player to a team", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      const updated = await addTeamMember(
        manager._id.toString(),
        team._id.toString(),
        [player._id],
      );

      expect(updated.members.map((member) => member._id.toString())).toContain(
        player._id.toString(),
      );
    });

    it("should reject an invalid user ID", async () => {
      const game = await createGame();

      await expect(
        addTeamMember("invalid-user-id", new Types.ObjectId().toString(), []),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid team ID", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");

      await expect(
        addTeamMember(manager._id.toString(), "invalid-team-id", [player._id]),
      ).rejects.toThrow("Invalid team ID");
    });

    it("should reject when no members are supplied", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        addTeamMember(manager._id.toString(), team._id.toString(), []),
      ).rejects.toThrow("At least one member is required");
    });

    it("should reject adding a duplicate member", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [player._id],
      });

      await expect(
        addTeamMember(manager._id.toString(), team._id.toString(), [
          player._id,
        ]),
      ).rejects.toThrow("All selected users are already members of this team");
    });

    it("should reject adding members beyond team capacity", async () => {
      const manager = await createUser("manager");
      const existingPlayer = await createUser("player");
      const newPlayer = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [existingPlayer._id],
        maxMembers: 1,
      });

      await expect(
        addTeamMember(manager._id.toString(), team._id.toString(), [
          newPlayer._id,
        ]),
      ).rejects.toThrow(
        "Adding these members would exceed the team limit of 1",
      );
    });

    it("should reject adding a non-existent member", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        addTeamMember(manager._id.toString(), team._id.toString(), [
          new Types.ObjectId(),
        ]),
      ).rejects.toThrow("One or more selected users do not exist");
    });

    it("should reject adding a non-player", async () => {
      const manager = await createUser("manager");
      const organizer = await createUser("organizer");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        addTeamMember(manager._id.toString(), team._id.toString(), [
          organizer._id,
        ]),
      ).rejects.toThrow("All team members must have the player role");
    });
  });

  // =========================================================
  // deleteTeamMember
  // =========================================================

  describe("deleteTeamMember", () => {
    it("should remove a member successfully", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [player._id],
      });

      const updated = await deleteTeamMember(
        manager._id.toString(),
        team._id.toString(),
        player._id.toString(),
      );

      expect(updated.members.map((member) => member.toString())).not.toContain(
        player._id.toString(),
      );
    });

    it("should reject an invalid member ID", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        deleteTeamMember(
          manager._id.toString(),
          team._id.toString(),
          "invalid-member-id",
        ),
      ).rejects.toThrow("Invalid member ID");
    });

    it("should reject a member who is not in the team", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        deleteTeamMember(
          manager._id.toString(),
          team._id.toString(),
          player._id.toString(),
        ),
      ).rejects.toThrow("Team member not found");
    });

    it("should reject an unauthorized user", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const anotherPlayer = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [player._id],
      });

      await expect(
        deleteTeamMember(
          anotherPlayer._id.toString(),
          team._id.toString(),
          player._id.toString(),
        ),
      ).rejects.toThrow("Forbidden");
    });
  });

  // =========================================================
  // leaveTeam
  // =========================================================

  describe("leaveTeam", () => {
    it("should allow a member to leave a team", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id, {
        members: [player._id],
      });

      const updated = await leaveTeam(
        player._id.toString(),
        team._id.toString(),
      );

      expect(updated.members.map((member) => member.toString())).not.toContain(
        player._id.toString(),
      );
    });

    it("should reject a user who is not a team member", async () => {
      const manager = await createUser("manager");
      const player = await createUser("player");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        leaveTeam(player._id.toString(), team._id.toString()),
      ).rejects.toThrow("You are not a member of this team");
    });
  });

  // =========================================================
  // deleteTeam
  // =========================================================

  describe("deleteTeam", () => {
    it("should allow a manager to delete a team", async () => {
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      const deleted = await deleteTeam(
        manager._id.toString(),
        team._id.toString(),
      );

      expect(deleted._id.toString()).toBe(team._id.toString());

      const found = await Teams.findById(team._id);

      expect(found).toBeNull();
    });

    it("should allow an admin to delete a team", async () => {
      const admin = await createUser("admin");
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      const deleted = await deleteTeam(
        admin._id.toString(),
        team._id.toString(),
      );

      expect(deleted._id.toString()).toBe(team._id.toString());
    });

    it("should reject a player from deleting a team", async () => {
      const player = await createUser("player");
      const manager = await createUser("manager");
      const game = await createGame();

      const team = await createExistingTeam(manager._id, game._id);

      await expect(
        deleteTeam(player._id.toString(), team._id.toString()),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject deleting a team that does not exist", async () => {
      const manager = await createUser("manager");

      await expect(
        deleteTeam(manager._id.toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow("Team not found");
    });
  });
});
