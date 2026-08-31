import Joi from "joi";

export const tournamentRegistrationSchema = Joi.object({
  teamId: Joi.string().required(),
});
