# Image Downloader CLI (imgdl)

A robust, real‑world Node.js tool to **bulk download images** from:
- Direct image URLs
- A local file (`.txt`, `.csv`, `.json`) containing URLs
- A webpage URL (scrapes `<img>` tags automatically)

## Why this solves a real problem
- **Content teams** often need to collect product or blog images from many sources.
- **Researchers** may need to build datasets from public pages.
- **Marketers** pull brand assets across multiple URLs quickly.
- This CLI handles **concurrency, retries, deduping, sane filenames,** and can **scrape** pages for images.

---

## Quick Start

### 1) Requirements
- Node.js **v18+**

### 2) Install dependencies
```bash
npm install
```

### 3) Run (examples)
```bash
# Help
npx imgdl --help
# or if installed globally after `npm i -g .`:
imgdl --help

# Download from a list file (txt/csv/json)
npx imgdl --input urls.txt --out downloads

# Scrape a webpage for all <img> tags, then download
npx imgdl --scrape https://example.com --out downloads

# Download from explicit urls (space-separated)
npx imgdl --out downloads https://site.com/a.jpg https://site.com/b.png

# Control concurrency and retries
npx imgdl --input urls.csv --out downloads --concurrency 8 --retries 5
```

### File Formats
- **TXT:** one URL per line
- **CSV:** must contain a column named `url` (case-insensitive)
- **JSON:** either `["https://...","https://..."]` or `{ "urls": ["https://..."] }`

---

## CLI Usage

```text
Usage: imgdl [options] [urls...]

Options:
  -i, --input <path>        Path to a txt/csv/json file with URLs
  -s, --scrape <url>        Scrape <img> srcs from a webpage and download
  -o, --out <dir>           Output directory (default: "downloads")
  -c, --concurrency <n>     Parallel downloads (default: 5)
  -r, --retries <n>         Retries per file (default: 3)
  -t, --timeout <ms>        Per-request timeout in ms (default: 20000)
  --prefix <text>           Prefix added to each saved filename
  --force                   Overwrite existing files
  --dry-run                 Show what would be downloaded without saving
  -q, --quiet               Minimal logging
  -v, --verbose             Extra logging
  -h, --help                Display help
```

---

## Examples

**From TXT**
```bash
echo "https://picsum.photos/seed/pic1/800/600" > urls.txt
echo "https://picsum.photos/seed/pic2/1200/800" >> urls.txt
npx imgdl -i urls.txt -o downloads
```

**From CSV**
```csv
url,title
https://picsum.photos/seed/a/800/600,Sample A
https://picsum.photos/seed/b/800/600,Sample B
```
```bash
npx imgdl -i urls.csv -o photos --concurrency 10
```

**Scrape a page**
```bash
npx imgdl -s https://unsplash.com -o unsplash-grab
```

---

## Install Globally (optional)

```bash
npm i -g .
# then just run:
imgdl --help
```

---

## Implementation Notes
- Uses **native `fetch`** (Node 18+) with **AbortController** for timeouts.
- **p-limit** for concurrency control.
- **Exponential backoff** on retries.
- **Content-Type aware** file extensions (falls back to URL extension when available).
- **Sanitized filenames** to avoid OS issues.
- **Dedupes** by hashing the original URL to keep files unique.

---

## Future Enhancements
- Respect `robots.txt` and `meta` noimageindex for scraping mode.
- Resume partial downloads and verify via checksum/ETag where available.
- Image transformation pipeline (resize, format convert) via an optional flag.
- Progress bar UI and JSONL logging for pipelines.
- Headless browser mode (Puppeteer/Playwright) for JS-heavy pages.
- Watch mode for live-updating input files.
- S3/GCS/Azure Blob output targets in addition to local FS.
- GUI front-end (Electron/Tauri) using the same core library.

---

