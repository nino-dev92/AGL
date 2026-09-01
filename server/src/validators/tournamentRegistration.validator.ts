import Joi from "joi";

export const tournamentRegistrationValidatorSchema = Joi.object({
  tournament: Joi.string().required(),

  team: Joi.string().required(),
});

export const reviewTournamentRegistrationValidatorSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),

  rejectionReason: Joi.string().trim().max(200).when("status", {
    is: "rejected",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
