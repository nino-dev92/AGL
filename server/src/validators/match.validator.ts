import Joi from "joi";

// Validation schema for creating a single match.

export const matchValidatorSchema = Joi.object({
  tournament: Joi.string().required(),

  teamA: Joi.string().required(),

  teamB: Joi.string().required(),

  scheduledDate: Joi.date().required(),

  round: Joi.string().trim().required(),

  matchNumber: Joi.number().integer().min(1).required(),
});

// Validation schema for updating an existing match.

export const updateMatchValidatorSchema = Joi.object({
  scheduledDate: Joi.date().optional(),

  status: Joi.string()
    .valid("pending", "ongoing", "completed", "cancelled")
    .optional(),

  result: Joi.string().trim().optional(),

  winner: Joi.string().optional(),
}).min(1);

// Validation schema for frontend-generated tournament matches.
export const tournamentMatchesValidatorSchema = Joi.object({
  matches: Joi.array()
    .items(
      Joi.object({
        teamA: Joi.string().required(),

        teamB: Joi.string().required(),

        scheduledDate: Joi.date().required(),

        round: Joi.string().trim().required(),

        matchNumber: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

export const matchResultValidatorSchema = Joi.object({
  result: Joi.string().trim().required(),

  winner: Joi.string().required(),
});
