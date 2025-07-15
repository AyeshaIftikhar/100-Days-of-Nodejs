# Dice Roll Simulator API

The Dice Roll Simulator API is a simple RESTful service built using Node.js and Express.js that simulates rolling one or more dice. It returns random values for each roll, supports different dice types (e.g., d6, d20), and allows for multiple dice in one request.

This project is great for games, math simulations, or teaching randomness in programming.

## Features

- Roll standard dice: d6, d8, d10, d12, d20, d100
- Roll custom-sided dice: e.g., d4, d30, etc.
- Roll multiple dice in one request
- Returns total, individual rolls, and metadata
- Simple and modular code structure

## 🔄 Endpoint

**GET** `/api/dice/roll`

### 🔧 Query Parameters

| Name   | Type   | Description                 | Default |
|--------|--------|-----------------------------|---------|
| sides  | number | Number of sides on the die  | 6       |
| count  | number | Number of dice to roll      | 1       |

### 🧪 Example

`GET /api/dice/roll?sides=20&count=3`

### ✅ Response

```json
{
  "sides": 20,
  "count": 3,
  "rolls": [4, 17, 12],
  "total": 33,
  "timestamp": "2025-07-15T11:00:00.000Z"
}
```

## 🚀 Future Enhancements

| Feature                     | Description |
|-----------------------------|-------------|
| 🧮 Roll notation support     | Accept `3d6`, `2d20`, etc. as a single input |
| 🔢 Probability stats         | Return expected value and probability distribution |
| 📊 Roll history endpoint     | Store and retrieve previous rolls (with UUIDs) |
| 🌐 Frontend UI integration   | Simple frontend to test rolls visually |
| 📈 Analytics                 | Track most rolled numbers, frequent users, etc. |
| 🛡️ Auth & rate limiting      | Protect against abuse |
| 🎲 Custom dice presets       | e.g., RPG-specific dice sets |
| 🔗 WebSocket support         | Real-time updates for group games |