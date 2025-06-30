#!/usr/bin/env node
const axios = require("axios");
const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
const { DateTime } = require("luxon");
const config = require("config");
const { plot } = require("nodeplotlib");

const apiKey = config.get("apikey");

const c = chalk.default || chalk;

// API configuration
const API_KEY = apiKey;
const BASE_URL = "https://v6.exchangerate-api.com/v6";

// Supported currencies (abbreviated list)
const COMMON_CURRENCIES = [
  { name: "US Dollar", code: "USD" },
  { name: "Euro", code: "EUR" },
  { name: "British Pound", code: "GBP" },
  { name: "Japanese Yen", code: "JPY" },
  { name: "Chinese Yuan", code: "CNY" },
  { name: "Indian Rupee", code: "INR" },
];

// Helper functions
function formatAmount(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Fetch exchange rate from API
async function getExchangeRate(from, to, date = "latest") {
  const ora = (await import("ora")).default; // dynamic import for ESM ora
  const spinner = ora(`Fetching ${from} → ${to} rates...`).start();

  try {
    const url =
      date === "latest"
        ? `${BASE_URL}/${API_KEY}/latest/${from}`
        : `${BASE_URL}/${API_KEY}/history/${from}/${date.substring(
            0,
            4
          )}/${date.substring(5, 7)}/${date.substring(8, 10)}`;

    const response = await axios.get(url);
    spinner.stop();

    if (response.data.result === "error") {
      console.log(c.red(`Error: ${response.data["error-type"]}`));
      process.exit(1);
    }

    return date === "latest"
      ? response.data.conversion_rates[to]
      : response.data.conversion_rates[date][to];
  } catch (error) {
    spinner.stop();
    console.log(c.red(`API Error: ${error.message}`));
    process.exit(1);
  }
}

// Show historical exchange rate graph
async function showRateHistory(from, to, days = 30) {
  const dates = [];
  const rates = [];

  for (let i = 0; i < days; i++) {
    const date = DateTime.now().minus({ days: i }).toISODate();
    const rate = await getExchangeRate(from, to, date);
    dates.push(date);
    rates.push(rate);
  }

  const data = [
    {
      x: dates.reverse(),
      y: rates.reverse(),
      type: "line",
    },
  ];

  plot(data, {
    title: `${from} to ${to} (Last ${days} days)`,
    xaxis: { title: "Date" },
    yaxis: { title: "Exchange Rate" },
  });
}

// Convert portfolio to a different currency
async function convertPortfolio(portfolio, toCurrency) {
  const results = [];

  for (const [currency, amount] of Object.entries(portfolio)) {
    const rate = await getExchangeRate(currency, toCurrency);
    results.push({
      currency,
      originalAmount: amount,
      convertedAmount: amount * rate,
      rate,
    });
  }

  // Display as formatted table
  console.table(
    results.map((r) => ({
      Currency: r.currency,
      Amount: formatAmount(r.originalAmount, r.currency),
      [`Value in ${toCurrency}`]: formatAmount(r.convertedAmount, toCurrency),
      Rate: r.rate.toFixed(6),
    }))
  );

  const total = results.reduce((sum, r) => sum + r.convertedAmount, 0);
  console.log(
    c.green.bold(
      `\nTotal portfolio value: ${formatAmount(total, toCurrency)}`
    )
  );
}

// Set an alert for a specific exchange rate
async function setRateAlert(from, to, targetRate, checkInterval = 3600000) {
  console.log(
    c.blue(`Alert set: Notify when 1 ${from} >= ${targetRate} ${to}`)
  );

  const checkRate = async () => {
    const rate = await getExchangeRate(from, to);
    console.log(
      c.gray(
        `[${new Date().toLocaleTimeString()}] Current rate: ${rate.toFixed(6)}`
      )
    );

    if (rate >= targetRate) {
      console.log(
        c.green.bold(
          `\nALERT: Rate reached ${rate.toFixed(6)} (Target: ${targetRate})`
        )
      );
      process.exit(0);
    }
  };

  await checkRate();
  setInterval(checkRate, checkInterval);
}

// Main conversion function
async function convertCurrency(amount, from, to, date = "latest") {
  const rate = await getExchangeRate(from, to, date);
  const convertedAmount = amount * rate;

  console.log(c.green.bold("\nConversion Result:"));
  console.log(
    c.blue(
      `${formatAmount(amount, from)} = ${formatAmount(convertedAmount, to)}`
    )
  );
  console.log(c.gray(`Exchange rate: 1 ${from} = ${rate.toFixed(6)} ${to}`));

  if (date !== "latest") {
    console.log(c.gray(`Historical rate for: ${date}`));
  }
}

// Interactive mode
async function interactiveModeConverter() {
  const prompt = inquirer.default ? inquirer.default.prompt : inquirer.prompt;
  const answers = await prompt([
    {
      type: "number",
      name: "amount",
      message: "Enter amount to convert:",
      default: 1,
      validate: (input) => input > 0 || "Amount must be positive",
    },
    {
      type: "list",
      name: "from",
      message: "Convert from:",
      choices: COMMON_CURRENCIES.map((c) => ({
        name: `${c.name} (${c.code})`,
        value: c.code,
      })),
      default: "USD",
    },
    {
      type: "list",
      name: "to",
      message: "Convert to:",
      choices: COMMON_CURRENCIES.map((c) => ({
        name: `${c.name} (${c.code})`,
        value: c.code,
      })),
      default: "EUR",
    },
    {
      type: "input",
      name: "date",
      message: "Enter date (YYYY-MM-DD) or leave blank for latest rates:",
      default: "latest",
      validate: (input) => {
        if (input === "latest") return true;
        return DateTime.fromISO(input).isValid || "Invalid date format";
      },
    },
  ]);

  await convertCurrency(answers.amount, answers.from, answers.to, answers.date);
}

async function interactiveMode() {
  const prompt = inquirer.default ? inquirer.default.prompt : inquirer.prompt;

  // Step 1: Choose action
  const { action } = await prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Convert Currency", value: "convert" },
        { name: "Show Rate History", value: "history" },
        { name: "Set Rate Alert", value: "alert" },
        { name: "Convert Portfolio", value: "portfolio" },
      ],
    },
  ]);

  // Step 2: Gather inputs based on action
  if (action === "convert") {
    const answers = await prompt([
      {
        type: "number",
        name: "amount",
        message: "Enter amount to convert:",
        default: 1,
        validate: (input) => input > 0 || "Amount must be positive",
      },
      {
        type: "list",
        name: "from",
        message: "Convert from:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "USD",
      },
      {
        type: "list",
        name: "to",
        message: "Convert to:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "EUR",
      },
      {
        type: "input",
        name: "date",
        message: "Enter date (YYYY-MM-DD) or leave blank for latest rates:",
        default: "latest",
        validate: (input) => {
          if (input === "latest" || input === "") return true;
          return DateTime.fromISO(input).isValid || "Invalid date format";
        },
        filter: (input) => (input === "" ? "latest" : input),
      },
    ]);
    await convertCurrency(
      answers.amount,
      answers.from,
      answers.to,
      answers.date
    );
  } else if (action === "history") {
    const answers = await prompt([
      {
        type: "list",
        name: "from",
        message: "Convert from:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "USD",
      },
      {
        type: "list",
        name: "to",
        message: "Convert to:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "EUR",
      },
      {
        type: "number",
        name: "days",
        message: "How many days of history?",
        default: 30,
        validate: (input) => input > 0 || "Days must be positive",
      },
    ]);
    await showRateHistory(answers.from, answers.to, answers.days);
  } else if (action === "alert") {
    const answers = await prompt([
      {
        type: "list",
        name: "from",
        message: "Convert from:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "USD",
      },
      {
        type: "list",
        name: "to",
        message: "Convert to:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "EUR",
      },
      {
        type: "number",
        name: "targetRate",
        message: "Alert me when rate is greater than or equal to:",
        validate: (input) => input > 0 || "Rate must be positive",
      },
      {
        type: "number",
        name: "interval",
        message: "Check interval in seconds:",
        default: 3600,
        validate: (input) => input > 0 || "Interval must be positive",
      },
    ]);
    await setRateAlert(
      answers.from,
      answers.to,
      answers.targetRate,
      answers.interval * 1000
    );
  } else if (action === "portfolio") {
    // Gather portfolio entries
    const portfolio = {};
    let addMore = true;
    while (addMore) {
      const entry = await prompt([
        {
          type: "list",
          name: "currency",
          message: "Currency:",
          choices: COMMON_CURRENCIES.map((c) => ({
            name: `${c.name} (${c.code})`,
            value: c.code,
          })),
        },
        {
          type: "number",
          name: "amount",
          message: "Amount:",
          validate: (input) => input > 0 || "Amount must be positive",
        },
        {
          type: "confirm",
          name: "more",
          message: "Add another currency?",
          default: false,
        },
      ]);
      portfolio[entry.currency] =
        (portfolio[entry.currency] || 0) + entry.amount;
      addMore = entry.more;
    }
    const { toCurrency } = await prompt([
      {
        type: "list",
        name: "toCurrency",
        message: "Convert portfolio to:",
        choices: COMMON_CURRENCIES.map((c) => ({
          name: `${c.name} (${c.code})`,
          value: c.code,
        })),
        default: "USD",
      },
    ]);
    await convertPortfolio(portfolio, toCurrency);
  }
}

// Command-line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  if (args.includes("--interactive") || args.includes("-i")) {
    await interactiveMode();
    return;
  }

  if (args.length === 0) {
    console.log(
      c.yellow("No arguments provided. Starting interactive mode...\n")
    );
    await interactiveMode();
    return;
  }

  // Parse command-line arguments
  if (args.length >= 3) {
    const amount = parseFloat(args[0]);
    const from = args[1].toUpperCase();
    const to = args[2].toUpperCase();
    const date = args[3] || "latest";

    if (isNaN(amount) || amount <= 0) {
      console.log(c.red("Error: Amount must be a positive number"));
      process.exit(1);
    }

    await convertCurrency(amount, from, to, date);
  } else {
    console.log(c.red("Error: Invalid arguments"));
    showHelp();
    process.exit(1);
  }
}

function showHelp() {
  console.log(c.blue.bold("\nCurrency Converter CLI\n"));
  console.log("Usage:");
  console.log(
    "  currency-converter <amount> <from_currency> <to_currency> [date]"
  );
  console.log("  currency-converter --interactive");
  console.log("  currency-converter --help\n");
  console.log("Examples:");
  console.log("  currency-converter 100 USD EUR");
  console.log("  currency-converter 500 JPY USD 2023-01-15");
  console.log("  currency-converter -i\n");
  console.log("Common currency codes:");
  COMMON_CURRENCIES.forEach((c) => {
    console.log(`  ${c.code.padEnd(5)} - ${c.name}`);
  });
}

// Run the program
main().catch(console.error);
