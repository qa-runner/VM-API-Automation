/**
 * Zod contracts for Invoice + Inquiry (loose — backend adds fields often).
 */
const { z } = require('zod');

const invoiceCreateSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({ id: z.union([z.number(), z.string()]) }).passthrough(),
}).passthrough();

const invoiceListSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
}).passthrough();

const inquiryCreateSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({ id: z.union([z.number(), z.string()]) }).passthrough(),
}).passthrough();

const inquiryListSuccessSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
}).passthrough();

module.exports = {
  invoiceCreateSuccessSchema,
  invoiceListSuccessSchema,
  inquiryCreateSuccessSchema,
  inquiryListSuccessSchema,
};
