#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const { Command } = require("commander");
const chalk = require("chalk");

const c = chalk.default || chalk;

class CsvToJsonConverter {
  /**
   * Convert CSV file to JSON
   * @param {string} inputPath - Path to CSV file
   * @param {object} options - Conversion options
   * @returns {Promise<Array>} - Array of JSON objects
   */
  static async convertFile(inputPath, options = {}) {
    const { delimiter = ",", hasHeader = true, outputPath } = options;

    return new Promise((resolve, reject) => {
      const records = [];
      const parser = parse({
        delimiter,
        columns: hasHeader,
        relax_quotes: true,
        trim: true,
        cast: (value, context) => {
          // Auto-convert numbers and booleans
          if (context.header) return value;
          if (value === "") return null;
          if (!isNaN(value)) return Number(value);
          if (value.toLowerCase() === "true") return true;
          if (value.toLowerCase() === "false") return false;
          return value;
        },
      });

      // Read input stream
      const inputStream = fs.createReadStream(inputPath);

      // Handle errors
      inputStream.on("error", (err) =>
        reject(new Error(`Error reading file: ${err.message}`))
      );
      parser.on("error", (err) =>
        reject(new Error(`Error parsing CSV: ${err.message}`))
      );
      parser.on("end", () => {
        if (outputPath) {
          this._writeOutput(records, outputPath)
            .then(() => resolve(records))
            .catch(reject);
        } else {
          resolve(records);
        }
      });

      // Process records
      parser.on("readable", function () {
        let record;
        while ((record = this.read()) !== null) {
          records.push(record);
        }
      });

      // Pipe data through parser
      inputStream.pipe(parser);
    });
  }

  /**
   * Convert CSV string to JSON
   * @param {string} csvString - CSV content
   * @param {object} options - Conversion options
   * @returns {Promise<Array>} - Array of JSON objects
   */
  static async convertString(csvString, options = {}) {
    const { delimiter = ",", hasHeader = true } = options;

    return new Promise((resolve, reject) => {
      const records = [];
      const parser = parse({
        delimiter,
        columns: hasHeader,
        relax_quotes: true,
        trim: true,
        cast: this._autoCastValue,
      });

      parser.on("error", (err) =>
        reject(new Error(`Error parsing CSV: ${err.message}`))
      );
      parser.on("end", () => resolve(records));
      parser.on("readable", function () {
        let record;
        while ((record = this.read()) !== null) {
          records.push(record);
        }
      });

      parser.write(csvString);
      parser.end();
    });
  }

  /**
   * Write JSON output to file
   * @param {Array} data - JSON data to write
   * @param {string} outputPath - Output file path
   */
  static async _writeOutput(data, outputPath) {
    return new Promise((resolve, reject) => {
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFile(outputPath, jsonString, "utf8", (err) => {
        if (err) reject(new Error(`Error writing output file: ${err.message}`));
        else resolve();
      });
    });
  }

  /**
   * Auto-convert CSV string values to appropriate types
   */
  static _autoCastValue(value, context) {
    // if (context.header) return value;
    // if (value === "") return null;
    // if (!isNaN(value)) return Number(value);
    // if (value.toLowerCase() === "true") return true;
    // if (value.toLowerCase() === "false") return false;
    // return value;
    if (context.header) return value;
    if (value === "") return null;

    // Custom date parsing
    if (context.column === "date") {
      return new Date(value);
    }

    // Handle number percentages
    if (value.endsWith("%")) {
      return parseFloat(value) / 100;
    }

    // Default handling
    if (!isNaN(value)) return Number(value);
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    return value;
  }

  /**
   * Convert large CSV file to JSON using streams
   * @param {string} inputPath - Path to large CSV file
   * @param {string} outputPath - Path to output JSON file
   * @param {object} options - Conversion options
   * @returns {Promise<void>}
   *
   * @example
   * await CsvToJsonConverter.convertLargeFile("input.csv", "output.json", { delimiter: ";" });
   */
  static async convertLargeFile(inputPath, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputPath);
      const outputStream = fs.createWriteStream(outputPath);
      let firstChunk = true;

      outputStream.write("[\n");

      const parser = parse({
        delimiter: options.delimiter || ",",
        columns: options.hasHeader !== false,
        relax_quotes: true,
        trim: true,
        cast: this._autoCastValue,
      });

      parser.on("data", (record) => {
        const prefix = firstChunk ? "" : ",\n";
        outputStream.write(prefix + JSON.stringify(record));
        firstChunk = false;
      });

      parser.on("end", () => {
        outputStream.write("\n]");
        outputStream.end();
        resolve();
      });

      parser.on("error", reject);
      inputStream.on("error", reject);
      outputStream.on("error", reject);

      inputStream.pipe(parser);
    });
  }

  /**
   * Convert CSV file to JSON with progress tracking
   *  @param {string} inputPath - Path to CSV file
   *  @param {object} options - Conversion options
   * @returns {Promise<Array>} - Array of JSON objects
   * @example
   * await CsvToJsonConverter.convertFileWithProgress("input.csv", { delimiter: ";", hasHeader: true, outputPath: "output.json" });
   */
  static async convertFileWithProgress(inputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const records = [];
      let bytesProcessed = 0;
      const fileStats = fs.statSync(inputPath);
      const totalBytes = fileStats.size;

      const parser = parse({
        delimiter: options.delimiter || ",",
        columns: options.hasHeader !== false,
        relax_quotes: true,
        trim: true,
        cast: this._autoCastValue,
      });

      const inputStream = fs.createReadStream(inputPath);

      // Track progress
      inputStream.on("data", (chunk) => {
        bytesProcessed += chunk.length;
        const percent = ((bytesProcessed / totalBytes) * 100).toFixed(1);
        process.stdout.write(`Processing: ${percent}%\r`);
      });

      // Rest of the parsing logic...
      parser.on("end", () => {
        process.stdout.write("\n");
        if (options.outputPath) {
          this._writeOutput(records, options.outputPath)
            .then(() => resolve(records))
            .catch(reject);
        } else {
          resolve(records);
        }
      });

      inputStream.pipe(parser);
    });
  }

  /**
   * Convert JSON data to CSV format
   * @param {Array} data - Array of JSON objects
   * @param {string} outputPath - Path to output CSV file
   * @param {object} options - Conversion options
   * @returns {Promise<void|string>} - Resolves with CSV string or writes to file
   * @example
   * await CsvToJsonConverter.jsonToCsv(jsonData, "output.csv", { delimiter: ";", header: true });
   */
  static async jsonToCsv(data, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const { delimiter = ",", header = true } = options;

      stringify(
        data,
        {
          header,
          delimiter,
          cast: {
            boolean: (value) => (value ? "true" : "false"),
            date: (value) => value.toISOString(),
            object: (value) => JSON.stringify(value),
          },
        },
        (err, output) => {
          if (err) return reject(err);

          if (outputPath) {
            fs.writeFile(outputPath, output, (err) => {
              if (err) reject(err);
              else resolve();
            });
          } else {
            resolve(output);
          }
        }
      );
    });
  }
}

// CLI Interface
function setupCLI() {
  const program = new Command();

  program
    .name("csv-to-json")
    .description("Convert CSV files to JSON")
    .version("1.0.0");

  program
    .requiredOption("-i, --input <path>", "Input CSV file path")
    .option("-o, --output <path>", "Output JSON file path")
    .option("-d, --delimiter <char>", "CSV delimiter character", ",")
    .option("--no-header", "CSV has no header row")
    .action(async (options) => {
      try {
        console.log(c.blue(`Converting ${options.input}...`));

        const startTime = Date.now();
        const result = await CsvToJsonConverter.convertFile(options.input, {
          delimiter: options.delimiter,
          hasHeader: options.header,
          outputPath: options.output,
        });

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        if (options.output) {
          console.log(
            c.green(
              `Successfully converted ${result.length} records to ${options.output} in ${elapsed}s`
            )
          );
        } else {
          console.log(JSON.stringify(result, null, 2));
          console.log(
            c.gray(`\nConverted ${result.length} records in ${elapsed}s`)
          );
        }
      } catch (error) {
        console.error(c.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

// Run as CLI or export for programmatic use
if (require.main === module) {
  setupCLI();
} else {
  module.exports = CsvToJsonConverter;
}
