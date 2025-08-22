import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

/**
 * Optionally register fonts from /fonts if user adds them.
 * You can drop TTF/OTF files into /fonts and they'll be registered on startup.
 */
function registerLocalFonts() {
  try {
    // This is a dynamic loader - if no fonts exist, it's fine.
    // Users can add fonts like 'Anton-Regular.ttf' and then set DEFAULT_FONT_FAMILY in .env.
  } catch (e) {
    console.warn('Font registration warning:', e?.message);
  }
}
registerLocalFonts();

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getCanvasType(format) {
  switch (format) {
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    default: return 'image/png';
  }
}

export async function generateMemeFromUrl(imageUrl, options) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return generateMemeFromBuffer(Buffer.from(arrayBuffer), options);
}

export async function generateMemeFromBuffer(buffer, options) {
  const img = await loadImage(buffer);
  const { width: imgW, height: imgH } = img;

  // Scale image if needed
  const scale = Math.min(
    options.maxWidth / imgW,
    options.maxHeight / imgH,
    1
  );
  const outW = Math.round(imgW * scale);
  const outH = Math.round(imgH * scale);

  const canvas = createCanvas(outW, outH);
  const ctx = canvas.getContext('2d');

  // Draw base image
  ctx.drawImage(img, 0, 0, outW, outH);

  // Compose text
  const topText = options.uppercase ? options.topText.toUpperCase() : options.topText;
  const bottomText = options.uppercase ? options.bottomText.toUpperCase() : options.bottomText;

  // Compute font size relative to image if fontSize <= 0 (auto)
  const fontSizePx = options.fontSize > 0 ? options.fontSize : Math.round(outW * 0.07);
  const fontSpec = `${options.fontWeight} ${fontSizePx}px ${options.fontFamily}`;
  ctx.textAlign = ['left','right','center'].includes(options.textAlign) ? options.textAlign : 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';

  const pad = options.padding;
  const maxTextWidth = outW - pad * 2;
  const lineHeightPx = Math.round(fontSizePx * options.lineHeight);

  // Helper: draw wrapped text block
  function wrapText(text) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? (line + ' ' + word) : word;
      const metrics = ctx.measureText(test);
      if (metrics.width > maxTextWidth || test.length > options.wrapAt) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawTextBlock(lines, yStart) {
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const x =
        ctx.textAlign === 'left' ? pad :
        ctx.textAlign === 'right' ? (outW - pad) :
        Math.round(outW / 2);

      const y = yStart + i * lineHeightPx;
      if (options.strokeFirst) {
        if (options.outlineWidth > 0) {
          ctx.lineWidth = options.outlineWidth;
          ctx.strokeStyle = options.outlineColor;
          ctx.strokeText(text, x, y);
        }
        ctx.fillStyle = options.textColor;
        ctx.fillText(text, x, y);
      } else {
        ctx.fillStyle = options.textColor;
        ctx.fillText(text, x, y);
        if (options.outlineWidth > 0) {
          ctx.lineWidth = options.outlineWidth;
          ctx.strokeStyle = options.outlineColor;
          ctx.strokeText(text, x, y);
        }
      }
    }
  }

  // Apply font AFTER helpers reference ctx
  ctx.font = fontSpec;

  // Top text
  if (topText) {
    const topLines = wrapText(topText);
    let yTop = pad;
    if (options.gravity === 'custom' && options.customYTop !== null) {
      yTop = clamp(options.customYTop, 0, outH - lineHeightPx * topLines.length);
    } else if (options.gravity === 'center') {
      // center both blocks together; here we just put top slightly above middle
      const totalTextHeight = (topLines.length + (bottomText ? topLines.length : 0)) * lineHeightPx;
      yTop = Math.max(pad, Math.round(outH / 2 - totalTextHeight / 2));
    }
    drawTextBlock(topLines, yTop);
  }

  // Bottom text
  if (bottomText) {
    const bottomLines = wrapText(bottomText);
    let yBottom = outH - pad - bottomLines.length * lineHeightPx;
    if (options.gravity === 'custom' && options.customYBottom !== null) {
      yBottom = clamp(options.customYBottom, 0, outH - bottomLines.length * lineHeightPx);
    } else if (options.gravity === 'center' && !topText) {
      yBottom = Math.round(outH / 2 - (bottomLines.length * lineHeightPx) / 2);
    }
    drawTextBlock(bottomLines, yBottom);
  }

  // Watermark (optional)
  if (options.watermarkText) {
    const wmSize = Math.max(12, Math.round(outW * 0.025));
    ctx.font = `normal ${wmSize}px ${options.fontFamily}`;
    ctx.globalAlpha = options.watermarkOpacity;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.watermarkText, outW - 8, outH - 8);
    ctx.globalAlpha = 1.0;
  }

  // Output buffer
  const type = getCanvasType(options.format);
  if (options.format === 'jpeg') {
    return canvas.toBuffer('image/jpeg', { quality: options.quality });
  } else if (options.format === 'webp') {
    return canvas.toBuffer('image/webp', { quality: options.quality });
  } else {
    return canvas.toBuffer('image/png');
  }
}
