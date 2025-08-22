import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup uploads folder
const upload = multer({ dest: "uploads/" });

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Generate meme route
app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const { topText, bottomText } = req.body;
    const filePath = req.file.path;

    // Load uploaded image
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    // Draw image
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Text settings
    const fontSize = parseInt(process.env.DEFAULT_FONT_SIZE) || 48;
    const font = process.env.DEFAULT_FONT || "Impact";
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = process.env.DEFAULT_TEXT_COLOR || "white";
    ctx.strokeStyle = process.env.DEFAULT_STROKE_COLOR || "black";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";

    // Top text
    if (topText) {
      ctx.fillText(topText, img.width / 2, fontSize, img.width - 20);
      ctx.strokeText(topText, img.width / 2, fontSize, img.width - 20);
    }

    // Bottom text
    if (bottomText) {
      ctx.fillText(bottomText, img.width / 2, img.height - 20, img.width - 20);
      ctx.strokeText(bottomText, img.width / 2, img.height - 20, img.width - 20);
    }

    // Watermark
    if (process.env.WATERMARK_TEXT) {
      ctx.font = `${process.env.WATERMARK_FONT_SIZE || 20}px Arial`;
      ctx.fillStyle = process.env.WATERMARK_COLOR || "rgba(255,255,255,0.5)";
      ctx.textAlign = "right";
      ctx.fillText(process.env.WATERMARK_TEXT, img.width - 10, img.height - 10);
    }

    // Output image
    const format = process.env.DEFAULT_IMAGE_FORMAT || "png";
    const buffer =
      format === "jpeg"
        ? canvas.toBuffer("image/jpeg", { quality: parseFloat(process.env.DEFAULT_QUALITY) || 0.9 })
        : canvas.toBuffer("image/png");

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    res.set("Content-Type", `image/${format}`);
    res.send(buffer);
  } catch (error) {
    console.error("Error generating meme:", error);
    res.status(500).send("Failed to generate meme.");
  }
});

const server = app.listen(PORT, () => console.log(`🚀 Meme Generator running at http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
    server.close();
    app.listen(PORT + 1, () => console.log(`🚀 Meme Generator running at http://localhost:${PORT + 1}`));
  } else {
    console.error('Server error:', err);
  }
});
