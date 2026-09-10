import Joi from "joi";

export const createDisputeValidatorSchema = Joi.object({
  match: Joi.string().required(),

  tournament: Joi.string().required(),

  reason: Joi.string()
    .valid(
      "match_result",
      "player_eligibility",
      "rule_violation",
      "match_conduct",
      "technical_issue",
      "other",
    )
    .required(),

  description: Joi.string().trim().min(10).max(1000).required(),
});

export const resolveDisputeValidatorSchema = Joi.object({
  status: Joi.string().valid("resolved", "rejected").required(),

  resolution: Joi.string().trim().min(10).max(1000).required(),
});
