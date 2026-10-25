import Joi from "joi";

export const userValidationSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  userName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().required(),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const playerProfileValidator = Joi.object({
  bio: Joi.string().trim().max(500).optional(),

  region: Joi.string().trim().max(100).optional(),

  game: Joi.string().trim().max(100).optional(),

  playerRole: Joi.string().trim().max(100).optional(),
});

export const playerStatsValidator = Joi.object({
  kills: Joi.number().integer().min(0).optional(),
  deaths: Joi.number().integer().min(0).optional(),
  games: Joi.number().integer().min(0).optional(),
  tourneysPlayed: Joi.number().integer().min(0).optional(),
  tourneysWon: Joi.number().integer().min(0).optional(),
}).min(1);

export const forgotPasswordValidatorSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidatorSchema = Joi.object({
  token: Joi.string().required(),

  password: Joi.string().min(8).required(),
});

export default playerProfileValidator;
