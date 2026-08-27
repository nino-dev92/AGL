import Joi from "joi";

export const categoryValidationSchema = Joi.object({
  name: Joi.string().trim().lowercase().min(3).max(50),
  description: Joi.string().trim().min(3).max(100).optional(),
});

export const updateCategoryValidationSchema = Joi.object({
  name: Joi.string().trim().lowercase().min(3).max(50),

  description: Joi.string().trim().min(3).max(100).optional(),
}).min(1);

export const categoryStatusValidationSchema = Joi.object({
  isActive: Joi.boolean().required(),
});
