import { z } from 'zod';

const urlSchema = z.string().url({ message: 'Must be a valid URL (include http/https)' });

export const screenshotSchema = z.object({
  url: urlSchema,
  width: z.number().int().min(320).max(3840).optional(),
  height: z.number().int().min(320).max(4320).optional(),
  deviceScaleFactor: z.number().min(0.5).max(4).optional(),
  fullPage: z.boolean().optional(),
  format: z.enum(['png', 'jpeg', 'webp']).optional(),
  quality: z.number().int().min(0).max(100).optional(),
  delayMs: z.number().int().min(0).max(30000).optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional()
});

export const pdfSchema = z.object({
  url: urlSchema,
  format: z.string().optional(), // Puppeteer accepts presets or sizes
  printBackground: z.boolean().optional(),
  margin: z.object({
    top: z.string(),
    right: z.string(),
    bottom: z.string(),
    left: z.string()
  }).optional(),
  delayMs: z.number().int().min(0).max(30000).optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional()
});
