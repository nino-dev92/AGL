import { Types } from "mongoose";

import Tournaments from "../../src/models/Tournaments";
import Users from "../../src/models/Users";
import Games from "../../src/models/Games";
import Category from "../../src/models/Category";

import {
  createNewTournament,
  getAllTournaments,
  getTournamentById,
  editTournament,
  //updateTournamentBanner,
  deleteTournamentBanner,
  changeTournamentStatus,
  deleteTournament,
} from "../../src/services/tournament.service";

jest.mock("../../src/utils/validateImage", () => ({
  validateImageBuffer: jest.fn(),
}));

jest.mock("../../src/utils/cloudinaryUpload", () => ({
  uploadToCloudinary: jest.fn(),
}));

jest.mock("../../src/config/cloudinary", () => ({
  uploader: {
    destroy: jest.fn(),
  },
}));

jest.mock("../../src/services/auditLog.service", () => ({
  createAuditLog: jest.fn(),
}));

describe("Tournament Service", () => {
  const createUser = async (
    role: "admin" | "organizer" | "manager" | "player",
  ) => {
    const id = new Types.ObjectId().toString();

    return Users.create({
      firstName: "Test",
      lastName: "User",
      userName: `user_${id}`,
      email: `user_${id}@test.com`,
      password: "Password123!",
      role,
    });
  };

  const createGame = async () => {
    const id = new Types.ObjectId().toString();

    const category = await Category.create({
      name: `Test Category ${id}`,
      description: "Test category",
    });

    return Games.create({
      name: `Test Game ${id}`,
      category: category._id,
    });
  };

  const createTournament = async (
    userId: string,
    gameId: string,
    overrides: Record<string, unknown> = {},
  ) => {
    return createNewTournament(userId, {
      name: `Test Tournament ${new Types.ObjectId().toString()}`,
      description: "Test tournament description",
      game: gameId,
      maxTeams: 16,
      registeredTeams: [],
      startDate: new Date("2030-01-01T10:00:00.000Z"),
      endDate: new Date("2030-01-10T10:00:00.000Z"),
      rules: ["No cheating", "Respect all players"],
      region: "Africa",
      entryFee: 100,
      prizePool: 1000,
      ...overrides,
    });
  };

  describe("createNewTournament", () => {
    it("should reject an invalid user ID", async () => {
      const game = await createGame();

      await expect(
        createNewTournament("invalid-id", {
          name: "Test Tournament",
          game: game._id.toString(),
          maxTeams: 16,
          registeredTeams: [],
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-01-10"),
          rules: [],
          region: "Africa",
          entryFee: 100,
          prizePool: 1000,
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid game ID", async () => {
      const admin = await createUser("admin");

      await expect(
        createNewTournament(admin._id.toString(), {
          name: "Test Tournament",
          game: "invalid-game-id",
          maxTeams: 16,
          registeredTeams: [],
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-01-10"),
          rules: [],
          region: "Africa",
          entryFee: 100,
          prizePool: 1000,
        }),
      ).rejects.toThrow("Invalid game ID");
    });

    it("should reject when the user does not exist", async () => {
      const game = await createGame();
      const userId = new Types.ObjectId().toString();

      await expect(
        createNewTournament(userId, {
          name: "Test Tournament",
          game: game._id.toString(),
          maxTeams: 16,
          registeredTeams: [],
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-01-10"),
          rules: [],
          region: "Africa",
          entryFee: 100,
          prizePool: 1000,
        }),
      ).rejects.toThrow("User not found");
    });

    it("should reject users who are not admin or organizer", async () => {
      const player = await createUser("player");
      const game = await createGame();

      await expect(
        createNewTournament(player._id.toString(), {
          name: "Test Tournament",
          game: game._id.toString(),
          maxTeams: 16,
          registeredTeams: [],
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-01-10"),
          rules: [],
          region: "Africa",
          entryFee: 100,
          prizePool: 1000,
        }),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject when the game does not exist", async () => {
      const admin = await createUser("admin");
      const gameId = new Types.ObjectId().toString();

      await expect(
        createNewTournament(admin._id.toString(), {
          name: "Test Tournament",
          game: gameId,
          maxTeams: 16,
          registeredTeams: [],
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-01-10"),
          rules: [],
          region: "Africa",
          entryFee: 100,
          prizePool: 1000,
        }),
      ).rejects.toThrow("Game not found");
    });

    it("should reject duplicate tournament names", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await createTournament(admin._id.toString(), game._id.toString(), {
        name: "Duplicate Tournament",
      });

      await expect(
        createTournament(admin._id.toString(), game._id.toString(), {
          name: "Duplicate Tournament",
        }),
      ).rejects.toThrow("Tournament name already exists");
    });

    it("should reject when start date is after end date", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await expect(
        createTournament(admin._id.toString(), game._id.toString(), {
          startDate: new Date("2030-02-01"),
          endDate: new Date("2030-01-01"),
        }),
      ).rejects.toThrow("Start date must be earlier than the end date");
    });

    it("should reject when start date equals end date", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const date = new Date("2030-01-01");

      await expect(
        createTournament(admin._id.toString(), game._id.toString(), {
          startDate: date,
          endDate: date,
        }),
      ).rejects.toThrow("Start date must be earlier than the end date");
    });

    it("should reject duplicate tournament slugs", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await createTournament(admin._id.toString(), game._id.toString(), {
        name: "First Tournament",
      });

      await expect(
        createTournament(admin._id.toString(), game._id.toString(), {
          name: "First Tournament",
        }),
      ).rejects.toThrow();
    });

    it("should create a tournament successfully", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
        {
          name: "My Test Tournament",
        },
      );

      expect(tournament).toBeDefined();
      expect(tournament.name).toBe("my test tournament");
      expect(tournament.slug).toBe("my-test-tournament");
      expect(tournament.game.toString()).toBe(game._id.toString());
      expect(tournament.organizer.toString()).toBe(admin._id.toString());
      expect(tournament.maxTeams).toBe(16);
      expect(tournament.rules).toEqual(["No cheating", "Respect all players"]);
    });

    it("should trim and normalize the tournament name", async () => {
      const organizer = await createUser("organizer");
      const game = await createGame();

      const tournament = await createTournament(
        organizer._id.toString(),
        game._id.toString(),
        {
          name: "  Summer Championship  ",
        },
      );

      expect(tournament.name).toBe("summer championship");
      expect(tournament.slug).toBe("summer-championship");
    });

    it("should allow an organizer to create a tournament", async () => {
      const organizer = await createUser("organizer");
      const game = await createGame();

      const tournament = await createTournament(
        organizer._id.toString(),
        game._id.toString(),
      );

      expect(tournament.organizer.toString()).toBe(organizer._id.toString());
    });
  });

  describe("getAllTournaments", () => {
    it("should retrieve tournaments", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await createTournament(admin._id.toString(), game._id.toString());
      await createTournament(admin._id.toString(), game._id.toString());

      const result = await getAllTournaments("", "", 1, 10);

      expect(result.allTournaments).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should search tournaments by name", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await createTournament(admin._id.toString(), game._id.toString(), {
        name: "Summer Championship",
      });

      await createTournament(admin._id.toString(), game._id.toString(), {
        name: "Winter League",
      });

      const result = await getAllTournaments("summer", "", 1, 10);

      expect(result.allTournaments).toHaveLength(1);
      expect(result.allTournaments[0]?.name).toBe("summer championship");
      expect(result.total).toBe(1);
    });

    it("should filter tournaments by game", async () => {
      const admin = await createUser("admin");

      const gameOne = await createGame();
      const gameTwo = await createGame();

      await createTournament(admin._id.toString(), gameOne._id.toString(), {
        name: "Game One Tournament",
      });

      await createTournament(admin._id.toString(), gameTwo._id.toString(), {
        name: "Game Two Tournament",
      });

      const result = await getAllTournaments("", gameOne._id.toString(), 1, 10);

      expect(result.allTournaments).toHaveLength(1);
      expect(result.allTournaments[0]?.game._id.toString()).toBe(
        gameOne._id.toString(),
      );
    });

    it("should reject an invalid game ID when filtering", async () => {
      await expect(
        getAllTournaments("", "invalid-game-id", 1, 10),
      ).rejects.toThrow("Invalid game ID");
    });

    it("should paginate tournaments", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      for (let i = 1; i <= 5; i++) {
        await createTournament(admin._id.toString(), game._id.toString(), {
          name: `Tournament ${i}`,
        });
      }

      const result = await getAllTournaments("", "", 2, 2);

      expect(result.allTournaments).toHaveLength(2);
      expect(result.total).toBe(5);
    });

    it("should return an empty result when no tournaments match", async () => {
      const result = await getAllTournaments("does-not-exist", "", 1, 10);

      expect(result.allTournaments).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("getTournamentById", () => {
    it("should reject an invalid tournament ID", async () => {
      await expect(getTournamentById("invalid-id")).rejects.toThrow(
        "Invalid tournament ID",
      );
    });

    it("should reject when tournament does not exist", async () => {
      const tournamentId = new Types.ObjectId().toString();

      await expect(getTournamentById(tournamentId)).rejects.toThrow(
        "Tournament not found",
      );
    });

    it("should retrieve a tournament successfully", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      const result = await getTournamentById(tournament._id.toString());

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(tournament._id.toString());
      expect(result.game).toBeDefined();
    });
  });

  describe("editTournament", () => {
    it("should reject an invalid user ID", async () => {
      const tournamentId = new Types.ObjectId().toString();

      await expect(
        editTournament("invalid-id", tournamentId, {
          name: "Updated Tournament",
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid tournament ID", async () => {
      const admin = await createUser("admin");

      await expect(
        editTournament(admin._id.toString(), "invalid-id", {
          name: "Updated Tournament",
        }),
      ).rejects.toThrow("Invalid tournament ID");
    });

    it("should reject when user does not exist", async () => {
      const tournamentId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(
        editTournament(userId, tournamentId, {
          name: "Updated Tournament",
        }),
      ).rejects.toThrow("User not found");
    });

    it("should reject when tournament does not exist", async () => {
      const admin = await createUser("admin");
      const tournamentId = new Types.ObjectId().toString();

      await expect(
        editTournament(admin._id.toString(), tournamentId, {
          name: "Updated Tournament",
        }),
      ).rejects.toThrow("Tournament not found");
    });

    it("should reject users who are not admin or organizer", async () => {
      const player = await createUser("player");
      const game = await createGame();
      const admin = await createUser("admin");

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        editTournament(player._id.toString(), tournament._id.toString(), {
          name: "Updated Tournament",
        }),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject an invalid game ID", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        editTournament(admin._id.toString(), tournament._id.toString(), {
          game: "invalid-game-id",
        }),
      ).rejects.toThrow("Invalid game ID");
    });

    it("should reject when the new game does not exist", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        editTournament(admin._id.toString(), tournament._id.toString(), {
          game: new Types.ObjectId().toString(),
        }),
      ).rejects.toThrow("Game not found");
    });

    it("should reject duplicate tournament names", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      await createTournament(admin._id.toString(), game._id.toString(), {
        name: "Existing Tournament",
      });

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
        {
          name: "Another Tournament",
        },
      );

      await expect(
        editTournament(admin._id.toString(), tournament._id.toString(), {
          name: "Existing Tournament",
        }),
      ).rejects.toThrow("Tournament name already exists");
    });

    it("should reject invalid dates", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        editTournament(admin._id.toString(), tournament._id.toString(), {
          startDate: new Date("2030-02-01"),
          endDate: new Date("2030-01-01"),
        }),
      ).rejects.toThrow("Start date must be earlier than the end date");
    });

    it("should update the tournament name and slug", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
        {
          name: "Original Tournament",
        },
      );

      const updated = await editTournament(
        admin._id.toString(),
        tournament._id.toString(),
        {
          name: "Updated Championship",
        },
      );

      expect(updated).toBeDefined();
      expect(updated!.name).toBe("updated championship");
      expect(updated!.slug).toBe("updated-championship");
    });

    it("should update the tournament game", async () => {
      const admin = await createUser("admin");
      const gameOne = await createGame();
      const gameTwo = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        gameOne._id.toString(),
      );

      const updated = await editTournament(
        admin._id.toString(),
        tournament._id.toString(),
        {
          game: gameTwo._id.toString(),
        },
      );

      expect(updated).toBeDefined();
      expect(updated!.game.toString()).toBe(gameTwo._id.toString());
    });

    it("should update tournament details without changing the name", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
        {
          name: "Original Tournament",
        },
      );

      const updated = await editTournament(
        admin._id.toString(),
        tournament._id.toString(),
        {
          description: "Updated description",
          maxTeams: 32,
        },
      );

      expect(updated).toBeDefined();
      expect(updated!.description).toBe("Updated description");
      expect(updated!.maxTeams).toBe(32);
      expect(updated!.name).toBe("original tournament");
    });
  });

  // describe("updateTournamentBanner", () => {
  //   const mockUpload = () => {
  //     const uploadToCloudinary =
  //       require("../../src/utils/cloudinaryUpload").uploadToCloudinary;

  //     uploadToCloudinary.mockResolvedValue({
  //       secure_url: "https://cloudinary.test/banner.jpg",
  //       public_id: "AGL/tournaments/banner-test",
  //     });
  //   };

  //   it("should reject an invalid user ID", async () => {
  //     const tournamentId = new Types.ObjectId().toString();

  //     await expect(
  //       updateTournamentBanner(
  //         "invalid-id",
  //         tournamentId,
  //         {} as Express.Multer.File,
  //       ),
  //     ).rejects.toThrow("Invalid user ID");
  //   });

  //   it("should reject an invalid tournament ID", async () => {
  //     const admin = await createUser("admin");

  //     await expect(
  //       updateTournamentBanner(
  //         admin._id.toString(),
  //         "invalid-id",
  //         {} as Express.Multer.File,
  //       ),
  //     ).rejects.toThrow("Invalid tournament ID");
  //   });

  //   it("should reject when no file is supplied", async () => {
  //     const admin = await createUser("admin");
  //     const tournamentId = new Types.ObjectId().toString();

  //     await expect(
  //       updateTournamentBanner(
  //         admin._id.toString(),
  //         tournamentId,
  //         undefined as unknown as Express.Multer.File,
  //       ),
  //     ).rejects.toThrow("Banner image is required");
  //   });

  //   it("should reject when the user does not exist", async () => {
  //     const game = await createGame();
  //     const admin = await createUser("admin");

  //     const tournament = await createTournament(
  //       admin._id.toString(),
  //       game._id.toString(),
  //     );

  //     const userId = new Types.ObjectId().toString();

  //     await expect(
  //       updateTournamentBanner(userId, tournament._id.toString(), {
  //         buffer: Buffer.from("fake-image"),
  //       } as Express.Multer.File),
  //     ).rejects.toThrow("User not found");
  //   });

  //   it("should reject when tournament does not exist", async () => {
  //     const admin = await createUser("admin");

  //     await expect(
  //       updateTournamentBanner(
  //         admin._id.toString(),
  //         new Types.ObjectId().toString(),
  //         {
  //           buffer: Buffer.from("fake-image"),
  //         } as Express.Multer.File,
  //       ),
  //     ).rejects.toThrow("Tournament not found");
  //   });

  //   it("should reject unauthorized users", async () => {
  //     const player = await createUser("player");
  //     const admin = await createUser("admin");
  //     const game = await createGame();

  //     const tournament = await createTournament(
  //       admin._id.toString(),
  //       game._id.toString(),
  //     );

  //     await expect(
  //       updateTournamentBanner(
  //         player._id.toString(),
  //         tournament._id.toString(),
  //         {
  //           buffer: Buffer.from("fake-image"),
  //         } as Express.Multer.File,
  //       ),
  //     ).rejects.toThrow("Forbidden");
  //   });

  //   it("should update the tournament banner successfully", async () => {
  //     mockUpload();

  //     const admin = await createUser("admin");
  //     const game = await createGame();

  //     const tournament = await createTournament(
  //       admin._id.toString(),
  //       game._id.toString(),
  //     );

  //     const result = await updateTournamentBanner(
  //       admin._id.toString(),
  //       tournament._id.toString(),
  //       {
  //         buffer: Buffer.from("fake-image"),
  //       } as Express.Multer.File,
  //     );

  //     expect(result.banner).toBe({
  //       url: "https://cloudinary.test/banner.jpg",
  //       publicId: "AGL/tournaments/banner-test",
  //     });
  //   });

  //   it("should replace an existing banner and delete the old one", async () => {
  //     mockUpload();

  //     const admin = await createUser("admin");
  //     const game = await createGame();

  //     const tournament = await createTournament(
  //       admin._id.toString(),
  //       game._id.toString(),
  //     );

  //     tournament.banner = {
  //       url: "https://cloudinary.test/old-banner.jpg",
  //       publicId: "AGL/tournaments/old-banner",
  //     };

  //     await tournament.save();

  //     await updateTournamentBanner(
  //       admin._id.toString(),
  //       tournament._id.toString(),
  //       {
  //         buffer: Buffer.from("fake-image"),
  //       } as Express.Multer.File,
  //     );

  //     const cloudinary = require("../../src/config/cloudinary");

  //     expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
  //       "AGL/tournaments/old-banner",
  //     );
  //   });
  // });

  describe("deleteTournamentBanner", () => {
    it("should reject an invalid user ID", async () => {
      await expect(
        deleteTournamentBanner("invalid-id", new Types.ObjectId().toString()),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid tournament ID", async () => {
      const admin = await createUser("admin");

      await expect(
        deleteTournamentBanner(admin._id.toString(), "invalid-id"),
      ).rejects.toThrow("Invalid tournament ID");
    });

    it("should reject when user does not exist", async () => {
      const userId = new Types.ObjectId().toString();
      const tournamentId = new Types.ObjectId().toString();

      await expect(
        deleteTournamentBanner(userId, tournamentId),
      ).rejects.toThrow("User not found");
    });

    it("should reject when tournament does not exist", async () => {
      const admin = await createUser("admin");

      await expect(
        deleteTournamentBanner(
          admin._id.toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow("Tournament not found");
    });

    it("should reject unauthorized users", async () => {
      const player = await createUser("player");
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        deleteTournamentBanner(
          player._id.toString(),
          tournament._id.toString(),
        ),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject when tournament has no banner", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        deleteTournamentBanner(admin._id.toString(), tournament._id.toString()),
      ).rejects.toThrow("No tournament banner found");
    });

    // it("should delete the tournament banner successfully", async () => {
    //   const admin = await createUser("admin");
    //   const game = await createGame();

    //   const tournament = await createTournament(
    //     admin._id.toString(),
    //     game._id.toString(),
    //   );

    //   tournament.banner = {
    //     url: "https://cloudinary.test/banner.jpg",
    //     publicId: "AGL/tournaments/banner-test",
    //   };

    //   await tournament.save();

    //   const cloudinary = require("../../src/config/cloudinary");

    //   cloudinary.uploader.destroy.mockResolvedValue({
    //     result: "ok",
    //   });

    //   const result = await deleteTournamentBanner(
    //     admin._id.toString(),
    //     tournament._id.toString(),
    //   );

    //   expect(result).toBeNull();

    //   const updated = await Tournaments.findById(tournament._id);

    //   expect(updated?.banner).toBeUndefined();

    //   expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
    //     "AGL/tournaments/banner-test",
    //   );
    // });

    // it("should remove the banner even when Cloudinary reports not found", async () => {
    //   const admin = await createUser("admin");
    //   const game = await createGame();

    //   const tournament = await createTournament(
    //     admin._id.toString(),
    //     game._id.toString(),
    //   );

    //   tournament.banner = {
    //     url: "https://cloudinary.test/banner.jpg",
    //     publicId: "AGL/tournaments/banner-test",
    //   };

    //   await tournament.save();

    //   const cloudinary = require("../../src/config/cloudinary");

    //   cloudinary.uploader.destroy.mockResolvedValue({
    //     result: "not found",
    //   });

    //   await expect(
    //     deleteTournamentBanner(admin._id.toString(), tournament._id.toString()),
    //   ).resolves.toBeNull();

    //   const updated = await Tournaments.findById(tournament._id);

    //   expect(updated?.banner).toBeUndefined();
    // });
  });

  describe("changeTournamentStatus", () => {
    it("should reject an invalid user ID", async () => {
      await expect(
        changeTournamentStatus(
          "invalid-id",
          new Types.ObjectId().toString(),
          "ongoing",
        ),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid tournament ID", async () => {
      const admin = await createUser("admin");

      await expect(
        changeTournamentStatus(admin._id.toString(), "invalid-id", "ongoing"),
      ).rejects.toThrow("Invalid tournament ID");
    });

    it("should reject when user does not exist", async () => {
      const userId = new Types.ObjectId().toString();
      const tournamentId = new Types.ObjectId().toString();

      await expect(
        changeTournamentStatus(userId, tournamentId, "ongoing"),
      ).rejects.toThrow("User not found");
    });

    it("should reject when tournament does not exist", async () => {
      const admin = await createUser("admin");

      await expect(
        changeTournamentStatus(
          admin._id.toString(),
          new Types.ObjectId().toString(),
          "ongoing",
        ),
      ).rejects.toThrow("Tournament not found");
    });

    it("should reject unauthorized users", async () => {
      const player = await createUser("player");
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        changeTournamentStatus(
          player._id.toString(),
          tournament._id.toString(),
          "ongoing",
        ),
      ).rejects.toThrow("Forbidden");
    });

    it("should change tournament status successfully", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      const updated = await changeTournamentStatus(
        admin._id.toString(),
        tournament._id.toString(),
        "ongoing",
      );

      expect(updated.status).toBe("ongoing");
    });

    it("should allow an organizer to change tournament status", async () => {
      const organizer = await createUser("organizer");
      const game = await createGame();

      const tournament = await createTournament(
        organizer._id.toString(),
        game._id.toString(),
      );

      const updated = await changeTournamentStatus(
        organizer._id.toString(),
        tournament._id.toString(),
        "completed",
      );

      expect(updated.status).toBe("completed");
    });

    it("should support cancelled status", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      const updated = await changeTournamentStatus(
        admin._id.toString(),
        tournament._id.toString(),
        "cancelled",
      );

      expect(updated.status).toBe("cancelled");
    });
  });

  describe("deleteTournament", () => {
    it("should reject an invalid user ID", async () => {
      await expect(
        deleteTournament("invalid-id", new Types.ObjectId().toString()),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject an invalid tournament ID", async () => {
      const admin = await createUser("admin");

      await expect(
        deleteTournament(admin._id.toString(), "invalid-id"),
      ).rejects.toThrow("Invalid tournament ID");
    });

    it("should reject when user does not exist", async () => {
      const userId = new Types.ObjectId().toString();
      const tournamentId = new Types.ObjectId().toString();

      await expect(deleteTournament(userId, tournamentId)).rejects.toThrow(
        "User not found",
      );
    });

    it("should reject when tournament does not exist", async () => {
      const admin = await createUser("admin");

      await expect(
        deleteTournament(admin._id.toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow("Tournament not found");
    });

    it("should reject unauthorized users", async () => {
      const player = await createUser("player");
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        deleteTournament(player._id.toString(), tournament._id.toString()),
      ).rejects.toThrow("Forbidden");
    });

    it("should delete a tournament successfully", async () => {
      const admin = await createUser("admin");
      const game = await createGame();

      const tournament = await createTournament(
        admin._id.toString(),
        game._id.toString(),
      );

      await expect(
        deleteTournament(admin._id.toString(), tournament._id.toString()),
      ).resolves.toBeNull();

      const deleted = await Tournaments.findById(tournament._id);

      expect(deleted).toBeNull();
    });

    // it("should delete the tournament banner from Cloudinary when one exists", async () => {
    //   const admin = await createUser("admin");
    //   const game = await createGame();

    //   const tournament = await createTournament(
    //     admin._id.toString(),
    //     game._id.toString(),
    //   );

    //   tournament.banner = {
    //     url: "https://cloudinary.test/banner.jpg",
    //     publicId: "AGL/tournaments/delete-banner",
    //   };

    //   await tournament.save();

    //   const cloudinary = require("../../src/config/cloudinary");

    //   cloudinary.uploader.destroy.mockResolvedValue({
    //     result: "ok",
    //   });

    //   await deleteTournament(admin._id.toString(), tournament._id.toString());

    //   expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
    //     "AGL/tournaments/delete-banner",
    //   );
    // });
  });
});
