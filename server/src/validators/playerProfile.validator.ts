import Joi from "joi";

const playerProfileValidator = Joi.object({
  bio: Joi.string().trim().max(500).optional(),

  country: Joi.string().trim().max(100).optional(),

  game: Joi.string().trim().max(100).optional(),

  playerRole: Joi.string().trim().max(100).optional(),
});

export default playerProfileValidator;
