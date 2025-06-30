# Currency Converter CLI
A command-line currency converter that uses real-time exchange rates from a reliable API.

## Features
- Real-time currency conversion
- Support for 170+ currencies
- Historical rate lookup
- Interactive mode
- Bulk conversion
- Colorful output

## API Key Setup
- Get a free API key from ExchangeRate-API
- Replace YOUR_API_KEY in the code
- Free tier allows 1,500 requests/month

### Simple Conversion
```bash
node index.js 100 USD EUR
```
### Historical Rates
```bash
node index.js 100 USD GBP 2023-01-15
```
### Interactive Mode
```bash
node index.js --interactive
```
## Bulk Conversion
```bash
echo "100 USD EUR\n50 GBP JPY" | xargs -n3 node index.js
```