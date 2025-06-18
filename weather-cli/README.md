# Weather CLI Tool 🌦️

A command-line tool to fetch current weather information for any city using the OpenWeatherMap API.


| ![New York](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/output/screenshots/weather-cli-newyork.png) | ![London](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/output/screenshots/weather-cli-london.png)  | 
| ------------ | -------- |
| ![Tokyo](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/output/screenshots/weather-cli-tokyo.png)  | ![London](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/output/screenshots/weather-cli-london-imperial.png)  | 


## Features

- ✅ Get current weather conditions for any city worldwide
- 🌡️ Temperature in Celsius, Fahrenheit, or Kelvin
- 💨 Wind speed and direction
- 💧 Humidity percentage
- 📊 Atmospheric pressure
- 👀 Visibility information
- 🎨 Colorful terminal output

### Project Setup

1. First, initialize a new Node.js project:
```bash
mkdir weather-cli
cd weather-cli
npm init -y
```

2. Install Required dependencies
```bash
npm install axios commander chalk
```

### Getting an API Key

- Go to [OpenWeatherMap](https://openweathermap.org/) and sign up for a free account
- Get your API key from the "API Keys" section
- Replace YOUR_API_KEY in the code with your actual API key

### Setup Config file to store API Keys

1. Create a `config` folder
```bash
mkdir config
```

2. Create a file named `default.json` inside the `config` folder.
```json
{
  "openWeatherApiKey": "YOUR_API_KEY_HERE",
}
```
Replace "YOUR_API_KEY_HERE" with your actual API key.

3. Install the `config` package
```bash
npm install config
```

4. Use the config in your code
```js
const config = require('config');

const apiKey = config.get('openWeatherApiKey');
const city = config.get('city');

console.log(`API Key: ${apiKey}`);
console.log(`City: ${city}`);
```

### Usage Example
```bash
# Get weather for a city (default metric units)
node weather.js -c "New York"
node weather.js --city "London"

# Get weather with imperial units
node weather.js -c London -u imperial

# Get weather with standard units (Kelvin)
node weather.js -c Tokyo -u standard
```


### Making the CLI Tool Executable [Optional]

1. Add this line to your package.json:
```json
"bin": {
  "weather": "./weather.js"
}
```

2. Make the file executable:
```bash
chmod +x weather.js
```

3. Install it globally for easy access:
```bash
npm install -g . 
```


