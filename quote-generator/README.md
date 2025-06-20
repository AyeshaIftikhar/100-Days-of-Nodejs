# 🎲 Random Quote Generator

This project is a Random Quote Generator built with Node.js.
It loads a list of quotes from a JSON file and displays a random quote in the terminal, with colored output using the `chalk` or `chalk-animation` libraries.

## Features

- **Loads Quotes from JSON:** Reads a quotes.json file (now from a config folder) containing an array of quotes.
- **Random Quote Selection:** Picks a random quote from the loaded list each time the program runs or on user request.
- **Colorful Terminal Output**: Uses chalk or chalk-animation to display the title and quotes in styled, colored text for better user experience.
- **Error Handling**: Handles errors gracefully (e.g., missing or malformed JSON) and prints clear error messages.
- **CLI Interaction:** Likely provides a command-line interface for users to get a new quote, possibly with options for categories or authors.
- **Modular Code Structure:** Separates concerns (loading quotes, displaying, error handling) into functions or classes.

## How It Works

- On startup, the app loads quotes from config/quotes.json.
- Displays a colorful banner/title in the terminal.
- Selects and prints a random quote, possibly with author attribution.
- Handles errors (e.g., missing file, bad JSON) and exits with a message if needed.
- May allow the user to request another quote or exit.

