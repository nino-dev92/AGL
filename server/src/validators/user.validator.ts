import Joi from "joi";

const userValidationSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  userName: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().required(),
});

export default userValidationSchema;
