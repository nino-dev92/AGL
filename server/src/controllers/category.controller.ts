import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as categoryService from "../services/category.service";

export const addCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;

  const newCategory = await categoryService.createCategory(userId, req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: newCategory,
  });
});

export const findAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const search = String(req.query.search ?? "");

    const page = Math.max(Number(req.query.page || 1), 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const categories = await categoryService.getAllCategories(
      search,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories.categories,
      pagination: {
        page,
        limit,
        total: categories.total,
        totalPages: Math.ceil(categories.total / limit),
      },
    });
  },
);

export const findCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = req.params.id as string;

    const category = await categoryService.getCategoryById(categoryId);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const categoryId = req.params.id as string;

    const update = await categoryService.editCategory(
      userId,
      categoryId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Category updated successfully",
      data: update,
    });
  },
);

export const updateCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const categoryId = req.params.id as string;

    const update = req.body.update;

    const updateStatus = await categoryService.editCategoryStatus(
      userId,
      categoryId,
      update,
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updateStatus,
    });
  },
);
