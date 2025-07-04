const fs = require("fs");
const path = require("path");

class PersistentCache {
  constructor(cacheDir = "./cache") {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }
  }

  getKey(url) {
    return Buffer.from(url)
      .toString("base64")
      .replace(/[^a-z0-9]/gi, "_");
  }

  get(url) {
    const filePath = path.join(this.cacheDir, this.getKey(url));
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
    return null;
  }

  set(url, data) {
    const filePath = path.join(this.cacheDir, this.getKey(url));
    fs.writeFileSync(filePath, JSON.stringify(data));
  }
}

module.exports = PersistentCache;
