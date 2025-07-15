# CSV to JSON Converter

CSV: Comma Separated Values

## Features

- Convert CSV files to JSON
- Support for custom delimiters
- Header row handling
- Type inference (automatic number/boolean conversion)
- Large file streaming support
- Command line interface
- Programmatic API

## Run Conversions

```bash
# Basic conversion
node csv-to-json.js -i input.csv -o output.json

# Custom delimiter (tab-separated)
node csv-to-json.js -i input.tsv -d "\t" -o output.json

# No header row
node csv-to-json.js -i input.csv --no-header -o output.json

# Pipe to stdout
node csv-to-json.js -i input.csv
```