import { Router } from 'express';
import multer from 'multer';
import { generateMemeFromBuffer, generateMemeFromUrl } from '../services/memeService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

const router = Router();

// POST /api/meme (multipart form-data with 'image')
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Use form field name "image".' });
    }
    const options = extractOptions(req);
    const result = await generateMemeFromBuffer(req.file.buffer, options);
    setResponseHeaders(res, options.format);
    return res.end(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/meme/from-url (json: { imageUrl, ...options })
router.post('/from-url', async (req, res, next) => {
  try {
    const { imageUrl } = req.body || {};
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    const options = extractOptions(req);
    const result = await generateMemeFromUrl(imageUrl, options);
    setResponseHeaders(res, options.format);
    return res.end(result);
  } catch (err) {
    next(err);
  }
});

function setResponseHeaders(res, format) {
  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
}

function extractOptions(req) {
  const q = { ...req.query, ...(req.body || {}) };
  return {
    topText: q.topText || '',
    bottomText: q.bottomText || '',
    fontFamily: q.fontFamily || process.env.DEFAULT_FONT_FAMILY || 'Impact',
    fontWeight: q.fontWeight || 'bold',
    textColor: q.textColor || '#ffffff',
    outlineColor: q.outlineColor || '#000000',
    outlineWidth: Number(q.outlineWidth ?? 4),
    textAlign: (q.textAlign || 'center'),
    fontSize: Number(q.fontSize ?? 42),
    padding: Number(q.padding ?? 20),
    lineHeight: Number(q.lineHeight ?? 1.15),
    watermarkText: q.watermarkText ?? process.env.WATERMARK_TEXT ?? '',
    watermarkOpacity: Math.max(0, Math.min(1, Number(q.watermarkOpacity ?? 0.25))),
    maxWidth: Number(q.maxWidth ?? process.env.MAX_WIDTH ?? 1200),
    maxHeight: Number(q.maxHeight ?? process.env.MAX_HEIGHT ?? 1200),
    format: (q.format || 'png').toLowerCase(), // png | jpeg | webp
    quality: Math.max(0.1, Math.min(1, Number(q.quality ?? 0.92))),
    gravity: q.gravity || 'top-bottom', // top-bottom | center | custom
    customYTop: q.customYTop ? Number(q.customYTop) : null,
    customYBottom: q.customYBottom ? Number(q.customYBottom) : null,
    uppercase: (String(q.uppercase || 'true').toLowerCase() === 'true'),
    strokeFirst: (String(q.strokeFirst || 'true').toLowerCase() === 'true'),
    wrapAt: Number(q.wrapAt ?? 28),
  };
}

export default router;
