/**
 * Zod contracts for Patient endpoints.
 * Patient.create returns { success, status, message, data: { data: {...}, print_receipt_id? } }.
 */
const { z } = require('zod');

const patientCreateSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({
    data: z.object({ id: z.union([z.number(), z.string()]) }).passthrough(),
    print_receipt_id: z.number().nullable().optional(),
  }).passthrough(),
});

const patientListSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number(),
  }).passthrough().optional(),
}).passthrough();

const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())),
});

module.exports = { patientCreateSuccessSchema, patientListSuccessSchema, validationErrorSchema };
