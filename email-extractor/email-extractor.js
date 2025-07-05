#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Command } = require("commander");

const c = chalk.default || chalk; // Fallback for older versions of chalk

// Email regex pattern (RFC 5322 compliant)
const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;

// Supported file extensions
const SUPPORTED_EXTENSIONS = new Set([
  ".txt",
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".csv",
  ".xml",
  ".php",
  ".py",
  ".java",
  ".rb",
  ".md",
  ".log",
  ".conf",
  ".cfg",
  ".ini",
]);

class EmailExtractor {
  constructor(options = {}) {
    this.options = {
      recursive: true,
      outputFile: null,
      verbose: false,
      ...options,
    };
    this.emails = new Set();
    this.fileCount = 0;
    this.fileProcessed = 0;
  }

  async extractFromPath(inputPath) {
    try {
      const stats = fs.statSync(inputPath);

      if (stats.isDirectory()) {
        await this._processDirectory(inputPath);
      } else if (stats.isFile()) {
        await this._processFile(inputPath);
      } else {
        console.log(c.yellow(`Skipping unsupported path: ${inputPath}`));
      }

      return this._getResults();
    } catch (error) {
      throw new Error(`Error processing ${inputPath}: ${error.message}`);
    }
  }

  async _processDirectory(dirPath) {
    if (this.options.verbose) {
      console.log(c.gray(`Scanning directory: ${dirPath}`));
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && this.options.recursive) {
        await this._processDirectory(fullPath);
      } else if (stats.isFile() && this._isSupportedFile(fullPath)) {
        this.fileCount++;
      }
    }

    // Now actually process the files (separate pass for better progress reporting)
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && this.options.recursive) {
        await this._processDirectory(fullPath);
      } else if (stats.isFile() && this._isSupportedFile(fullPath)) {
        await this._processFile(fullPath);
        this.fileProcessed++;
        this._printProgress();
      }
    }
  }

  async _processFile(filePath) {
    if (this.options.verbose) {
      console.log(c.gray(`Processing file: ${filePath}`));
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const matches = content.match(EMAIL_REGEX) || [];

      matches.forEach((email) => {
        // Normalize email (lowercase, remove surrounding quotes)
        const normalized = email
          .trim()
          .toLowerCase()
          .replace(/^"+|"+$/g, "");
        this.emails.add(normalized);
      });
    } catch (error) {
      if (this.options.verbose) {
        console.log(c.yellow(`Could not read ${filePath}: ${error.message}`));
      }
    }
  }

  _isSupportedFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
  }

  _printProgress() {
    if (this.fileCount > 0 && process.stdout.isTTY) {
      const percent = Math.floor((this.fileProcessed / this.fileCount) * 100);
      process.stdout.write(
        `\rProcessing: ${percent}% (${this.fileProcessed}/${this.fileCount})`
      );
      if (this.fileProcessed === this.fileCount) {
        process.stdout.write("\n");
      }
    }
  }

  _getResults() {
    return Array.from(this.emails).sort();
  }

  async _writeOutput(emails, outputPath) {
    try {
      const content = emails.join("\n");
      fs.writeFileSync(outputPath, content, "utf-8");
      console.log(c.green(`\nResults saved to ${outputPath}`));
    } catch (error) {
      throw new Error(`Could not write to ${outputPath}: ${error.message}`);
    }
  }
}

// CLI Interface
function setupCLI() {
  const program = new Command();

  program
    .name("email-extractor")
    .description("Extract email addresses from files and directories")
    .version("1.0.0");

  program
    .requiredOption("-i, --input <path>", "Input file or directory path")
    .option("-o, --output <path>", "Output file path")
    .option("-r, --no-recursive", "Disable recursive directory scanning")
    .option("-v, --verbose", "Enable verbose logging")
    .action(async (options) => {
      try {
        console.log(c.blue("Starting email extraction..."));

        const extractor = new EmailExtractor({
          recursive: options.recursive,
          outputFile: options.output,
          verbose: options.verbose,
        });

        const emails = await extractor.extractFromPath(options.input);

        console.log(c.green(`\nFound ${emails.length} unique email addresses`));

        if (options.output) {
          await extractor._writeOutput(emails, options.output);
        } else {
          console.log("\nExtracted emails:");
          emails.forEach((email) => console.log(email));
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
  module.exports = EmailExtractor;
}
