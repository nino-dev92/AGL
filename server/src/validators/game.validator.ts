import joi from "joi";

const gameValidationSchema = joi.object({
  name: joi.string().required().trim().min(3).max(50),
  category: joi.string().required().trim(),
});

export default gameValidationSchema;
