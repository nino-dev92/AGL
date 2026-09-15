import Joi from "joi";

export const getAuditLogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(20),

  resource: Joi.string().valid(
    "user",
    "team",
    "game",
    "tournament",
    "registration",
    "match",
    "dispute",
    "announcement",
    "notification",
  ),

  action: Joi.string().valid(
    "create",
    "update",
    "delete",
    "approve",
    "reject",
    "start",
    "complete",
    "cancel",
    "resolve",
  ),

  user: Joi.string().hex().length(24),
});
