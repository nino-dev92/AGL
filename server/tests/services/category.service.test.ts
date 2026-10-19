import { Types } from "mongoose";
import Category from "../../src/models/Category";
import Users from "../../src/models/Users";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  editCategory,
  editCategoryStatus,
} from "../../src/services/category.service";

const createUser = async (
  role: "admin" | "organizer" | "manager" | "player",
) => {
  return Users.create({
    firstName: "Test",
    lastName: "User",
    userName: `testuser_${new Types.ObjectId().toString()}`,
    email: `test_${new Types.ObjectId().toString()}@example.com`,
    password: "Password123!",
    role,
  });
};

describe("Category Service", () => {
  describe("createCategory", () => {
    it("should create a category for a manager", async () => {
      const user = await createUser("manager");

      const category = await createCategory(user._id.toString(), {
        name: "Strategy",
        description: "Strategy games",
      });

      expect(category).toBeDefined();
      expect(category.name).toBe("strategy");
      expect(category.description).toBe("Strategy games");
    });

    it("should create a category for an organizer", async () => {
      const user = await createUser("organizer");

      const category = await createCategory(user._id.toString(), {
        name: "Sports",
        description: "Sports games",
      });

      expect(category.name).toBe("sports");
    });

    it("should reject an invalid user ID", async () => {
      await expect(
        createCategory("invalid-user-id", {
          name: "Sports",
          description: "Sports games",
        }),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should reject a user that does not exist", async () => {
      const userId = new Types.ObjectId().toString();

      await expect(
        createCategory(userId, {
          name: "Sports",
          description: "Sports games",
        }),
      ).rejects.toThrow("User not found");
    });

    it("should reject a player from creating a category", async () => {
      const user = await createUser("player");

      await expect(
        createCategory(user._id.toString(), {
          name: "Sports",
          description: "Sports games",
        }),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject a duplicate category", async () => {
      const user = await createUser("organizer");

      await createCategory(user._id.toString(), {
        name: "Sports",
        description: "Sports games",
      });

      await expect(
        createCategory(user._id.toString(), {
          name: "SPORTS",
          description: "Another description",
        }),
      ).rejects.toThrow("Category already exists");
    });
  });

  describe("getAllCategories", () => {
    beforeEach(async () => {
      await Category.create([
        {
          name: "football",
          description: "Football games",
        },
        {
          name: "basketball",
          description: "Basketball games",
        },
        {
          name: "racing",
          description: "Racing games",
        },
      ]);
    });

    it("should return all categories", async () => {
      const result = await getAllCategories("", 1, 20);

      expect(result.categories).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it("should search categories by name", async () => {
      const result = await getAllCategories("ball", 1, 20);

      expect(result.categories).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should paginate categories", async () => {
      const result = await getAllCategories("", 1, 2);

      expect(result.categories).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe("getCategoryById", () => {
    it("should return a category by ID", async () => {
      const category = await Category.create({
        name: "football",
        description: "Football games",
      });

      const result = await getCategoryById(category._id.toString());

      expect(result._id.toString()).toBe(category._id.toString());
      expect(result.name).toBe("football");
    });

    it("should reject an invalid category ID", async () => {
      await expect(getCategoryById("invalid-category-id")).rejects.toThrow(
        "Invalid category ID",
      );
    });

    it("should reject a category that does not exist", async () => {
      const categoryId = new Types.ObjectId().toString();

      await expect(getCategoryById(categoryId)).rejects.toThrow(
        "Category not found",
      );
    });
  });

  describe("editCategory", () => {
    it("should allow an admin to edit a category", async () => {
      const user = await createUser("admin");

      const category = await Category.create({
        name: "football",
        description: "Football games",
      });

      const result = await editCategory(
        user._id.toString(),
        category._id.toString(),
        {
          name: "Soccer",
          description: "Updated description",
        },
      );

      expect(result.name).toBe("soccer");
      expect(result.description).toBe("Updated description");
    });

    it("should allow an organizer to edit a category", async () => {
      const user = await createUser("organizer");

      const category = await Category.create({
        name: "football",
        description: "Football games",
      });

      const result = await editCategory(
        user._id.toString(),
        category._id.toString(),
        {
          name: "Soccer",
        },
      );

      expect(result.name).toBe("soccer");
    });

    it("should reject a manager from editing a category", async () => {
      const user = await createUser("manager");

      const category = await Category.create({
        name: "football",
        description: "Football games",
      });

      await expect(
        editCategory(user._id.toString(), category._id.toString(), {
          name: "Soccer",
        }),
      ).rejects.toThrow("Forbidden");
    });

    it("should reject a missing category", async () => {
      const user = await createUser("admin");
      const categoryId = new Types.ObjectId().toString();

      await expect(
        editCategory(user._id.toString(), categoryId, {
          name: "Soccer",
        }),
      ).rejects.toThrow("Category not found");
    });

    it("should reject a duplicate category name", async () => {
      const user = await createUser("admin");

      const category = await Category.create({
        name: "football",
        description: "Football games",
      });

      await Category.create({
        name: "basketball",
        description: "Basketball games",
      });

      await expect(
        editCategory(user._id.toString(), category._id.toString(), {
          name: "basketball",
        }),
      ).rejects.toThrow("Category already exists");
    });
  });

  describe("editCategoryStatus", () => {
    it("should update category status", async () => {
      const user = await createUser("admin");

      const category = await Category.create({
        name: "football",
        description: "Football games",
        isActive: true,
      });

      const result = await editCategoryStatus(
        user._id.toString(),
        category._id.toString(),
        false,
      );

      expect(result.isActive).toBe(false);
    });

    it("should reject a player from updating category status", async () => {
      const user = await createUser("player");

      const category = await Category.create({
        name: "football",
        description: "Football games",
        isActive: true,
      });

      await expect(
        editCategoryStatus(user._id.toString(), category._id.toString(), false),
      ).rejects.toThrow("Forbidden");
    });
  });
});
