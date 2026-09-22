import Category from "../models/Category";
import ApiError from "../utils/apiError";
import Users from "../models/Users";
import { Types } from "mongoose";
type CategoryDTO = {
  name: string;
  description: string;
};
type CategoryUpdateDTO = {
  name?: string;
  description?: string;
};

export const createCategory = async (userId: string, data: CategoryDTO) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  // check if user exists and user role
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const isAdminOrOrganizer =
    user.role === "manager" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if category exists
  const exists = await Category.findOne({ name: data.name.toLowerCase() });

  if (exists) throw new ApiError("Category already exists", 409);

  // create category

  const newCategory = await Category.create({
    name: data.name.toLowerCase(),
    description: data.description,
  });

  return newCategory;
};

export const getAllCategories = async (
  search: string,
  page: number,
  limit: number,
) => {
  const filter: Record<string, unknown> = {};

  const skip = (page - 1) * limit;

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  const categories = await Category.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const total = await Category.countDocuments(filter);

  return { categories, total };
};

export const getCategoryById = async (categoryId: string) => {
  if (!Types.ObjectId.isValid(categoryId))
    throw new ApiError("Invalid category ID", 400);

  const category = await Category.findById(categoryId).sort({ name: 1 });

  if (!category) throw new ApiError("Category not found", 404);

  return category;
};

export const editCategory = async (
  userId: string,
  categoryId: string,
  data: CategoryUpdateDTO,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(categoryId)) {
    throw new ApiError("Invalid category ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  const category = await Category.findById(categoryId);

  if (!category) throw new ApiError("Category not found", 404);

  if (data.name) {
    const name = data.name.toLowerCase();

    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: categoryId },
    });

    if (existingCategory) throw new ApiError("Category already exists", 409);

    category.name = name;
  }

  if (data.description) category.description = data.description;

  await category.save();

  return category;
};

export const editCategoryStatus = async (
  userId: string,
  categoryId: string,
  update: boolean,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(categoryId))
    throw new ApiError("Invalid category ID", 400);

  const [user, category] = await Promise.all([
    Users.findById(userId),
    Category.findById(categoryId),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!category) throw new ApiError("Category not found", 404);

  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  console.log(update);

  category.isActive = update;

  await category.save();

  return category;
};
