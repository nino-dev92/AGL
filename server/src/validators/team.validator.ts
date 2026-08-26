import Joi from "joi";

const teamValidationSchema = Joi.object({
  name: Joi.string().required().min(3).trim(),
  description: Joi.string().max(500).trim().optional(),
  captain: Joi.string().required(),
  game: Joi.string().required().min(3).trim(),
  maxMembers: Joi.number().integer().min(2).max(100).required(),
});

export default teamValidationSchema;
