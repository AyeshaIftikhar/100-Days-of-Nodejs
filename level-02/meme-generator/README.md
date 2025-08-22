# Meme Generator (Canvas)

A production-ready, **Node.js + Express** microservice that generates classic memes using the HTML Canvas API (via **@napi-rs/canvas**). It solves a real-world problem for creators, marketers, and community managers who need **fast, consistent meme creation** for social media, support chats, or internal team fun—without opening a heavy editor.

## ✨ Features

- Upload an image or provide an image URL
- Add **top** and **bottom** text, automatic wrapping
- Bold fonts, **outline stroke** (classic meme style), custom colors
- Adjustable font size, alignment, line height, padding
- **Watermark** support (for brand attribution)
- Output **PNG / JPEG / WebP** with quality control
- **Rate limiting**, **CORS**, **Helmet** for basic hardening
- Lightweight demo UI at `/` to try instantly
- Dockerfile included

## 🧩 Tech

- Node.js 18+
- Express
- @napi-rs/canvas (prebuilt binaries → fewer native build issues than node-canvas)
- Multer for uploads
- Helmet, CORS, Rate limiting

---

## 🚀 Quick Start

```bash
# 1) Unzip and enter the project
unzip meme-generator-canvas.zip && cd meme-generator-canvas

# 2) Copy env
cp .env.example .env

# 3) Install dependencies
npm install

# 4) Run
npm run start
# or dev with hot reload
npm run dev
```

Open http://localhost:${PORT:-3000} and use the form to generate memes.  
You can also call the API directly.

### API

#### `POST /api/meme` (multipart form-data)

- **image**: file (required)
- **topText**: string
- **bottomText**: string
- **fontFamily**: string (default `Impact` or your system default)
- **fontWeight**: string (`bold` by default)
- **textColor**: hex (`#ffffff`)
- **outlineColor**: hex (`#000000`)
- **outlineWidth**: number (default `4`)
- **textAlign**: `left|center|right` (default `center`)
- **fontSize**: number (default `46`)
- **padding**: number (default `20`)
- **lineHeight**: number (default `1.15`)
- **watermarkText**: string
- **watermarkOpacity**: 0..1 (default `0.25`)
- **maxWidth**: number (default `1200`)
- **maxHeight**: number (default `1200`)
- **format**: `png|jpeg|webp` (default `png`)
- **quality**: 0.1..1 (for jpeg/webp, default `0.92`)
- **gravity**: `top-bottom|center|custom`
- **customYTop**: number (when gravity `custom`)
- **customYBottom**: number (when gravity `custom`)
- **uppercase**: `true|false` (default `true`)
- **strokeFirst**: `true|false` (default `true`)
- **wrapAt**: number (max characters per line fallback)

**cURL example**

```bash
curl -X POST http://localhost:3000/api/meme   -F "image=@/path/to/photo.jpg"   -F "topText=HELLO WORLD"   -F "bottomText=FROM NODE.JS"   -o meme.png
```

#### `POST /api/meme/from-url` (JSON)

```json
{
  "imageUrl": "https://example.com/cat.jpg",
  "topText": "TOP",
  "bottomText": "BOTTOM",
  "format": "jpeg",
  "quality": 0.9
}
```

```bash
curl -X POST http://localhost:3000/api/meme/from-url   -H "Content-Type: application/json"   -d '{"imageUrl":"https://picsum.photos/1200","topText":"TOP","bottomText":"BOTTOM"}'   --output meme.jpg
```

---

## 🧰 Configuration

See `.env.example` for options:

```ini
PORT=3000
CORS_ORIGIN=*
WATERMARK_TEXT=made with MemeGen
MAX_WIDTH=1200
MAX_HEIGHT=1200
DEFAULT_FONT_FAMILY=Impact
```

> **Fonts:** If you need a specific font, drop a TTF/OTF into the `fonts/` folder and set `DEFAULT_FONT_FAMILY` in `.env`. Many systems already provide Arial/Impact—@napi-rs/canvas will use system fonts when available.

---

## 🐳 Docker

```bash
# Build
docker build -t meme-generator .
# Run
docker run --rm -p 3000:3000 --env-file .env meme-generator
```

---

## 🧪 Why this solves a real problem

- **Social teams** and **indie creators** need quick, repeatable meme generation for engagement without opening Canva/Photoshop.
- **Support/community managers** can auto-generate reply memes in bots or integrations.
- **Batch processing** and automation via API removes manual toil → faster content cycles.

---

## 🔒 Production Notes

- Put this behind a reverse proxy (Nginx) with TLS.
- Adjust `express-rate-limit` and `helmet` policies for your environment.
- If running at scale, serve static files via CDN, and add caching for frequent templates.

---

## 🧭 Project Structure

```
meme-generator-canvas/
├─ public/               # Minimal front-end demo
├─ src/
│  ├─ routes/meme.js     # API routes
│  ├─ services/memeService.js  # Core canvas logic
│  └─ app.js             # Express app
├─ server.js
├─ .env.example
├─ package.json
└─ Dockerfile
```

---

## 🛣️ Future Enhancements

- **Text boxes & draggable positions** in the demo UI
- **Multi-line custom placement** with drag handles
- **Stickers/emojis** overlay + positioning
- **Template library** with saved presets
- **S3/Cloud storage** for saving generated memes
- **Auth & quotas** for multi-tenant SaaS
- **Queue + worker** for batch jobs
- **Localization** (RTL text support & language-aware wrapping)
- **CLI tool** for local batch creation

---

## ❓FAQ

- **Why @napi-rs/canvas instead of node-canvas?** It ships prebuilt binaries for common platforms, avoiding most native build headaches.
- **Does it require a GPU?** No.
- **Can I add custom fonts?** Yes—drop font files into `fonts/` and set `DEFAULT_FONT_FAMILY`.

Happy memeing! 🎉
