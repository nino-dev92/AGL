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

  country: Joi.string().trim().max(100).optional(),

  game: Joi.string().trim().max(100).optional(),

  playerRole: Joi.string().trim().max(100).optional(),
});

export default playerProfileValidator;
