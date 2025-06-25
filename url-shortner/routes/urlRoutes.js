const express = require("express");
const router = express.Router();
const urlModel = require("../models/urlModel");
const { isValidUrl } = require("../utils/helpers");
const config = require("../utils/config");

// Shorten URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res
      .status(400)
      .json({ success: false, message: "URL is required", data: null });
  }

  if (!isValidUrl(originalUrl)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid URL", data: null });
  }

  try {
    const url = await urlModel.createUrl(originalUrl);
    const shortUrl = `${config.BASE_URL}/${url.shortCode}`;
    res.json({
      success: true,
      message: "URL shortened successfully!",
      data: { originalUrl, shortUrl, shortCode: url.shortCode },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
});

// Redirect to original URL
router.get("/:shortCode", async (req, res) => {
  try {
    const url = await urlModel.getUrl(req.params.shortCode);
    if (url) {
      res.redirect(url.originalUrl);
    } else {
      res
        .status(404)
        .json({ success: false, message: "URL not found", data: null });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
});

// Get all URLs (for debugging)
router.get("/", async (req, res) => {
  try {
    const urls = await urlModel.getAllUrls();
    res.json({
      success: true,
      message: "URLs retrieved successfully",
      data: { urls },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
});

module.exports = router;
