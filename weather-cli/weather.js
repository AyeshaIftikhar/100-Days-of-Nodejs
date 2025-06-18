const axios = require("axios"); // HTTP client for API requests
const { program }  = require("commander"); // CLI argument parser
const chalk = require("chalk"); // For colored console output
const config = require('config'); // Configuration management

const c = chalk.default || chalk;

const API_KEY = config.get("openWeatherApiKey"); // Replace with your actual API key from OpenWeatherMap
// console.log(c.bold.blue(`Using API Key: ${API_KEY}`));
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Initialize CLI
program
  .version("1.0.0")
  .description("A CLI tool to fetch weather information")
  .requiredOption("-c, --city <city>", "City name")
  .option(
    "-u, --units <units>",
    "Units: standard, metric, or imperial",
    "metric"
  )
  .parse(process.argv);

const options = program.opts();

// fetch weather data
async function getWeather(city, units = "metric") {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        units: units,
        appid: API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Error: ${error.response.data.message}`);
    } else {
      throw new Error(
        "Failed to fetch weather data. Please check your network connection."
      );
    }
  }
}

// Display weather information
function displayWeather(data, units) {
  const tempUnit =
    units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
  const windUnit = units === "imperial" ? "mph" : "m/s";
  // console.log to print weather information
  console.log(c.bold.blue("\nWeather Information:"));
  console.log(c.bold(`📍 Location: ${data.name}, ${data.sys.country}`));
  console.log(
    `🌡️  Temperature: ${data.main.temp}${tempUnit} (Feels like ${data.main.feels_like}${tempUnit})`
  );
  console.log(
    `☁️  Condition: ${data.weather[0].main} - ${data.weather[0].description}`
  );
  console.log(`💧 Humidity: ${data.main.humidity}%`);
  console.log(`🌬️  Wind: ${data.wind.speed} ${windUnit}, ${data.wind.deg}°`);
  console.log(`📊 Pressure: ${data.main.pressure} hPa`);
  console.log(`👀 Visibility: ${data.visibility / 1000} km`);
}

// Main function
async function main() {
  try {
    const weatherData = await getWeather(options.city, options.units);
    displayWeather(weatherData, options.units);
  } catch (error) {
    console.error(c.red(error.message));
    process.exit(1);
  }
}

main();
