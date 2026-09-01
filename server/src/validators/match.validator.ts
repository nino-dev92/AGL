import Joi from "joi";

/**
 * Validation schema for creating a single match.
 *
 * The tournament ID is handled separately by the service
 * because the single-match endpoint receives it in the request body.
 */
export const matchValidatorSchema = Joi.object({
  tournament: Joi.string().required(),

  teamA: Joi.string().required(),

  teamB: Joi.string().required(),

  scheduledDate: Joi.date().required(),

  round: Joi.string().trim().required(),

  matchNumber: Joi.number().integer().min(1).required(),
});

/**
 * Validation schema for updating an existing match.
 *
 * Team A, Team B and Tournament are intentionally not included.
 *
 * Once a match has been created, changing the participating
 * teams could corrupt the tournament bracket.
 */
export const updateMatchValidatorSchema = Joi.object({
  scheduledDate: Joi.date().optional(),

  status: Joi.string()
    .valid("pending", "ongoing", "completed", "cancelled")
    .optional(),

  result: Joi.string().trim().optional(),

  winner: Joi.string().optional(),
}).min(1);

/**
 * Validation schema for frontend-generated tournament matches.
 *
 * The tournament ID comes from the route:
 *
 * /v1/tournaments/:tournamentId/matches
 *
 * Therefore each individual match does not need to contain
 * the tournament ID.
 */
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
