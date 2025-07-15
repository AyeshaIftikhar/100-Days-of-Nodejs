const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const express = require('express');
const cors = require('cors');

const defaultData = { countries: [] };
const db = new Low(new JSONFile('./db.json'), defaultData); // Pass defaultData here

const app = express();
app.use(cors());

async function startServer() {
  await db.read();
  db.data = db.data || defaultData;

  app.get("/", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "✅ Rest Countries API is running",
    });
  });
  // ...rest of your routes, replacing db.get("countries").value() with db.data.countries...

  // Get all countries
  app.get("/countries", (req, res) => {
    res.json({ countries: db.data.countries || [] });
  });

  // Search by country name
  app.get("/countries/name/:name", (req, res) => {
    const name = req.params.name.toLowerCase();
    const countries = db.data.countries.filter(
      (country) =>
        country.name.common.toLowerCase().includes(name) ||
        country.name.official.toLowerCase().includes(name)
    );
    res.json(countries);
  });

  // Get country by code
  app.get("/countries/code/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    const country = db.data.countries.find(
      (country) => country.cca2 === code || country.cca3 === code
    );
    if (!country) return res.status(404).json({ error: "Country not found" });
    res.json(country);
  });

  // Get countries by region
  app.get("/countries/region/:region", (req, res) => {
    const region = req.params.region.toLowerCase();
    const countries = db.data.countries.filter(
      (country) => country.region.toLowerCase() === region
    );
    res.json(countries);
  });

  // Get countries by language
  app.get("/countries/lang/:language", (req, res) => {
    const language = req.params.language.toLowerCase();
    const countries = db.data.countries.filter((country) =>
      Object.keys(country.languages || {}).some(
        (lang) => lang.toLowerCase() === language
      )
    );
    res.json(countries);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("❌ Press Ctrl+C to stop the server");
  });
}

startServer();