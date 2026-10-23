import Joi from "joi";

export const tournamentValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),

  description: Joi.string().trim().min(3).max(500).optional(),

  game: Joi.string().required(),

  maxTeams: Joi.number().integer().min(2).required(),

  startDate: Joi.date().required(),

  endDate: Joi.date().greater(Joi.ref("startDate")).required(),

  rules: Joi.array().items(Joi.string().trim().min(1)).optional(),

  entryFee: Joi.number().integer().min(1).required(),

  prizePool: Joi.number().integer().min(1).required(),

  region: Joi.string().valid("Africa", "Canada", "USA", "Europe").required(),
});
