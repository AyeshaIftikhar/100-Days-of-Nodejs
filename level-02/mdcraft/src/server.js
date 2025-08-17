import express from "express";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import { CONFIG } from "./config.js";
import { seo } from "./middleware/seo.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import pages from "./routes/pages.js";
import api from "./routes/api.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");  // This tells Express to use layout.ejs as the default layout

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
  })
);

app.use(seo);

app.use("/", pages);
app.use("/", api);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

app.listen(CONFIG.PORT, () => {
  console.log(`MDCraft running at ${CONFIG.SITE_URL} (port ${CONFIG.PORT})`);
  console.log(`API documentation available at ${CONFIG.SITE_URL}/api-docs`);
  console.log(`Running on http://localhost:${CONFIG.PORT}`);
  console.log("Press Ctrl+C to stop");
});
