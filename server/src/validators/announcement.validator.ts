import Joi from "joi";

export const createAnnouncementValidatorSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required(),

  content: Joi.string().trim().max(3000).required(),

  type: Joi.string()
    .valid("general", "tournament", "match", "system")
    .required(),

  tournament: Joi.string().optional(),
});

export const updateAnnouncementValidatorSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional(),

  content: Joi.string().trim().max(3000).optional(),

  type: Joi.string()
    .valid("general", "tournament", "match", "system")
    .optional(),

  tournament: Joi.string().optional(),
}).min(1);
