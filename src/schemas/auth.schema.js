/**
 * Zod contracts for Auth endpoints.
 * Loose where the API is loose (e.g. /user returns varying shapes),
 * strict where it matters (login success must include token).
 */
const { z } = require('zod');

const loginSuccessSchema = z.object({
  message: z.string(),
  user: z.unknown(),
  token: z.string().min(10),
});

const loginValidationErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())),
});

const loginInvalidCredsSchema = z.object({
  error: z.string(),
});

module.exports = { loginSuccessSchema, loginValidationErrorSchema, loginInvalidCredsSchema };
