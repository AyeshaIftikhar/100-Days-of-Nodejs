import { Router } from 'express';
import { takeScreenshotHandler, takePdfHandler } from '../controllers/screenshot.controller.js';

const router = Router();

/**
 * POST /api/screenshot
 * Body: { url, width?, height?, fullPage?, deviceScaleFactor?, format?, quality?, delayMs?, waitUntil? }
 */
router.post('/screenshot', takeScreenshotHandler);

/**
 * POST /api/pdf
 * Body: { url, format?, printBackground?, margin?, delayMs?, waitUntil? }
 */
router.post('/pdf', takePdfHandler);

export default router;
