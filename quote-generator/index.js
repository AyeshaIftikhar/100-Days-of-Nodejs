const fs = require("fs");
const path = require("path");
const chalk = require("chalk"); // Colorful console output
const config = require("config"); // Configuration management
const chalkAnimation = require("chalk-animation").default;

const c = chalk.default || chalk;

class QuoteGenerator {
  constructor() {
    this.quotes = [];
    this.loadQuotes();
  }

  // Load quotes from JSON file
  loadQuotes() {
    try {
      const quotesPath = path.join(__dirname, "config", "quotes.json"); // updated path
      const data = fs.readFileSync(quotesPath, "utf8");
      const parsedData = JSON.parse(data);
      this.quotes = parsedData.quotes;
      console.log(
        c.green.bold(
          `📚 Successfully loaded ${c.cyan(this.quotes.length)} quotes!`
        )
      );
    } catch (error) {
      console.error(
        c.red.bold("❌ Error loading quotes:"),
        c.red(error.message)
      );
      process.exit(1);
    }
  }

  // Get a random quote
  getRandomQuote() {
    if (this.quotes.length === 0) {
      return { text: "No quotes available", author: "System" };
    }

    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  // Display a formatted quote with colors
  displayQuote(quote) {
    const border = c.magenta("═".repeat(80));
    const sideBorder = c.magenta("║");

    console.log("\n" + border);
    console.log(sideBorder + c.yellow.bold(` 💭 "${quote.text}"`));
    console.log(sideBorder);
    console.log(sideBorder + c.blue.italic(`    — ${quote.author}`));
    console.log(border + "\n");
  }

  // Get multiple random quotes (no duplicates)
  getMultipleQuotes(count = 3) {
    const selectedQuotes = [];
    const usedIndexes = new Set();

    for (let i = 0; i < Math.min(count, this.quotes.length); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * this.quotes.length);
      } while (usedIndexes.has(randomIndex));

      usedIndexes.add(randomIndex);
      selectedQuotes.push(this.quotes[randomIndex]);
    }

    return selectedQuotes;
  }

  // Search quotes by author
  getQuotesByAuthor(authorName) {
    return this.quotes.filter((quote) =>
      quote.author.toLowerCase().includes(authorName.toLowerCase())
    );
  }

  // Search quotes by keyword in text
  searchQuotes(keyword) {
    return this.quotes.filter((quote) =>
      quote.text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Get all unique authors
  getAllAuthors() {
    const authors = [...new Set(this.quotes.map((quote) => quote.author))];
    return authors.sort();
  }

  // Interactive mode with colorful interface
  startInteractiveMode() {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Welcome screen
    console.log(
      c.cyan("╔══════════════════════════════════════════════════════════════╗")
    );
    console.log(
      c.cyan("║") +
        c.yellow.bold(
          "          🎯 INTERACTIVE QUOTE GENERATOR 🎯                "
        ) +
        c.cyan("║")
    );
    console.log(
      c.cyan("╚══════════════════════════════════════════════════════════════╝")
    );

    console.log(c.green.bold("\n📋 Available Commands:"));
    console.log(
      c.white("  ") + c.cyan.bold("1") + c.white(" - 🎲 Get random quote")
    );
    console.log(
      c.white("  ") + c.cyan.bold("2") + c.white(" - 📚 Get multiple quotes")
    );
    console.log(
      c.white("  ") + c.cyan.bold("3") + c.white(" - 👤 Search by author")
    );
    console.log(
      c.white("  ") + c.cyan.bold("4") + c.white(" - 🔍 Search by keyword")
    );
    console.log(
      c.white("  ") + c.cyan.bold("5") + c.white(" - 📝 List all authors")
    );
    console.log(c.white("  ") + c.red.bold("q") + c.white(" - 🚪 Quit\n"));

    const askCommand = () => {
      rl.question(c.green.bold("🎮 Enter your choice: "), (answer) => {
        console.log(""); // Add spacing

        switch (answer.trim().toLowerCase()) {
          case "1":
            console.log(c.magenta.bold("🎲 Generating random quote..."));
            const quote = this.getRandomQuote();
            this.displayQuote(quote);
            askCommand();
            break;

          case "2":
            rl.question(
              c.yellow("📚 How many quotes would you like? (default: 3): "),
              (num) => {
                const count = parseInt(num) || 3;
                console.log(
                  c.magenta.bold(`🎲 Generating ${count} random quotes...`)
                );
                const quotes = this.getMultipleQuotes(count);
                quotes.forEach((q, index) => {
                  console.log(
                    c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`)
                  );
                  this.displayQuote(q);
                });
                askCommand();
              }
            );
            break;

          case "3":
            rl.question(c.yellow("👤 Enter author name: "), (author) => {
              const quotes = this.getQuotesByAuthor(author);
              if (quotes.length > 0) {
                console.log(
                  c.green.bold(
                    `📖 Found ${c.cyan(
                      quotes.length
                    )} quote(s) by "${c.yellow.italic(author)}":`
                  )
                );
                quotes.forEach((q, index) => {
                  console.log(
                    c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`)
                  );
                  this.displayQuote(q);
                });
              } else {
                console.log(
                  c.red.bold(`❌ No quotes found for "${c.yellow(author)}"`)
                );
              }
              askCommand();
            });
            break;

          case "4":
            rl.question(c.yellow("🔍 Enter search keyword: "), (keyword) => {
              const quotes = this.searchQuotes(keyword);
              if (quotes.length > 0) {
                console.log(
                  c.green.bold(
                    `🔍 Found ${c.cyan(
                      quotes.length
                    )} quote(s) containing "${c.yellow.italic(keyword)}":`
                  )
                );
                quotes.forEach((q, index) => {
                  console.log(
                    c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`)
                  );
                  this.displayQuote(q);
                });
              } else {
                console.log(
                  c.red.bold(
                    `❌ No quotes found containing "${c.yellow(keyword)}"`
                  )
                );
              }
              askCommand();
            });
            break;

          case "5":
            const authors = this.getAllAuthors();
            console.log(c.magenta.bold("👥 All Available Authors:"));
            console.log(c.cyan("┌" + "─".repeat(50) + "┐"));
            authors.forEach((author, index) => {
              const num = c.cyan.bold((index + 1).toString().padStart(2));
              console.log(
                c.cyan("│ ") +
                  num +
                  c.white(". ") +
                  c.yellow(author.padEnd(44)) +
                  c.cyan(" │")
              );
            });
            console.log(c.cyan("└" + "─".repeat(50) + "┘\n"));
            askCommand();
            break;

          case "q":
          case "quit":
          case "exit":
            console.log(
              c.yellow.bold("👋 Thanks for using the Quote Generator!")
            );
            console.log(c.green("✨ Stay inspired! ✨\n"));
            rl.close();
            break;

          default:
            console.log(
              c.red.bold("❌ Invalid command!"),
              c.white("Please enter 1-5 or q to quit.")
            );
            askCommand();
        }
      });
    };

    askCommand();
  }

  // Display statistics
  displayStats() {
    const authors = this.getAllAuthors();
    const avgLength = Math.round(
      this.quotes.reduce((sum, quote) => sum + quote.text.length, 0) /
        this.quotes.length
    );

    console.log(c.blue.bold("\n📊 Quote Collection Statistics:"));
    console.log(c.cyan("╭─────────────────────────────────────╮"));
    console.log(
      c.cyan("│ ") +
        c.white("Total Quotes: ") +
        c.yellow.bold(this.quotes.length.toString().padEnd(20)) +
        c.cyan(" │")
    );
    console.log(
      c.cyan("│ ") +
        c.white("Unique Authors: ") +
        c.yellow.bold(authors.length.toString().padEnd(18)) +
        c.cyan(" │")
    );
    console.log(
      c.cyan("│ ") +
        c.white("Average Length: ") +
        c.yellow.bold((avgLength + " chars").padEnd(17)) +
        c.cyan(" │")
    );
    console.log(c.cyan("╰─────────────────────────────────────╯\n"));
  }
}

// Main execution function
function main() {
  const generator = new QuoteGenerator();
  const args = process.argv.slice(2);

  // Show welcome banner for CLI usage
  if (args.length === 0) {
    chalkAnimation.rainbow("🌈 RANDOM QUOTE GENERATOR 🌈");
    const quote = generator.getRandomQuote();
    generator.displayQuote(quote);
    console.log(
      c.gray.italic(
        '💡 Tip: Use "node index.js help" to see all available commands!'
      )
    );
    return;
  }

  // Handle command line arguments
  switch (args[0].toLowerCase()) {
    case "random":
    case "r":
      console.log(c.magenta.bold("🎲 Here's your random quote:"));
      const quote = generator.getRandomQuote();
      generator.displayQuote(quote);
      break;

    case "multiple":
    case "m":
      const count = parseInt(args[1]) || 3;
      console.log(c.magenta.bold(`🎲 Here are ${count} random quotes:`));
      const quotes = generator.getMultipleQuotes(count);
      quotes.forEach((q, index) => {
        console.log(c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`));
        generator.displayQuote(q);
      });
      break;

    case "author":
    case "a":
      if (args[1]) {
        const quotes = generator.getQuotesByAuthor(args[1]);
        if (quotes.length > 0) {
          console.log(
            c.green.bold(`📖 Quotes by "${c.yellow.italic(args[1])}":`)
          );
          quotes.forEach((q, index) => {
            console.log(
              c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`)
            );
            generator.displayQuote(q);
          });
        } else {
          console.log(
            c.red.bold(`❌ No quotes found for "${c.yellow(args[1])}"`)
          );
        }
      } else {
        console.log(c.red.bold("❌ Please provide an author name"));
        console.log(c.yellow('Example: node index.js author "Steve Jobs"'));
      }
      break;

    case "search":
    case "s":
      if (args[1]) {
        const quotes = generator.searchQuotes(args[1]);
        if (quotes.length > 0) {
          console.log(
            c.green.bold(`🔍 Quotes containing "${c.yellow.italic(args[1])}":`)
          );
          quotes.forEach((q, index) => {
            console.log(
              c.gray(`--- Quote ${index + 1} of ${quotes.length} ---`)
            );
            generator.displayQuote(q);
          });
        } else {
          console.log(
            c.red.bold(`❌ No quotes found containing "${c.yellow(args[1])}"`)
          );
        }
      } else {
        console.log(c.red.bold("❌ Please provide a search keyword"));
        console.log(c.yellow('Example: node index.js search "success"'));
      }
      break;

    case "authors":
      const authors = generator.getAllAuthors();
      console.log(c.magenta.bold("👥 All Available Authors:"));
      console.log(c.cyan("┌" + "─".repeat(50) + "┐"));
      authors.forEach((author, index) => {
        const num = c.cyan.bold((index + 1).toString().padStart(2));
        console.log(
          c.cyan("│ ") +
            num +
            c.white(". ") +
            c.yellow(author.padEnd(44)) +
            c.cyan(" │")
        );
      });
      console.log(c.cyan("└" + "─".repeat(50) + "┘"));
      break;

    case "stats":
      generator.displayStats();
      break;

    case "interactive":
    case "i":
      generator.startInteractiveMode();
      break;

    case "help":
    case "h":
      console.log(c.blue.bold("📋 Random Quote Generator - Usage Guide"));
      console.log(c.cyan("════════════════════════════════════════════════"));
      console.log(c.white("Basic Commands:"));
      console.log(
        c.green("  node index.js") +
          c.gray("                    # Show random quote")
      );
      console.log(
        c.green("  node index.js random") +
          c.gray("             # Show random quote")
      );
      console.log(
        c.green("  node index.js multiple [count]") +
          c.gray("   # Show multiple quotes")
      );
      console.log("");
      console.log(c.white("Search Commands:"));
      console.log(
        c.green('  node index.js author "name"') +
          c.gray("      # Show quotes by author")
      );
      console.log(
        c.green('  node index.js search "keyword"') +
          c.gray("   # Search quotes by keyword")
      );
      console.log("");
      console.log(c.white("Information Commands:"));
      console.log(
        c.green("  node index.js authors") +
          c.gray("            # List all authors")
      );
      console.log(
        c.green("  node index.js stats") +
          c.gray("              # Show collection statistics")
      );
      console.log("");
      console.log(c.white("Interactive Mode:"));
      console.log(
        c.green("  node index.js interactive") +
          c.gray("        # Start interactive mode")
      );
      console.log("");
      console.log(c.white("Help:"));
      console.log(
        c.green("  node index.js help") +
          c.gray("               # Show this help")
      );
      console.log(c.cyan("════════════════════════════════════════════════"));
      break;

    default:
      console.log(c.red.bold("❌ Unknown command:"), c.yellow(args[0]));
      console.log(
        c.white("Use"),
        c.green.bold('"node index.js help"'),
        c.white("for usage information.")
      );
  }
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = QuoteGenerator;
