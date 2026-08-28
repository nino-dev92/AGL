import Joi from "joi";

export const matchValidatorSchema = Joi.object({
  tournament: Joi.string().required(),
  teamA: Joi.string().required(),
  teamB: Joi.string().required(),
  scheduledDate: Joi.date().required(),
  round: Joi.string().required(),
});
