# Palindrom Checker API

A Palindrome Checker API is a web service that determines whether a given input string is a palindrome - a word, phrase, number, or other sequence of characters that reads the same forward and backward (ignoring spaces, punctuation, and capitalization).

## What the API Does

**Core Functionality:**

- Accepts a text string as input
- Processes the string according to configurable rules
- Returns whether the string is a palindrome (true/false)

## Key Features:

- Case-insensitive checking ("Racecar" = palindrome)
- Optional space handling ("A man a plan a canal Panama" = palindrome)
- Special character ignoring ("Madam, I'm Adam" = palindrome)
- Configurable checking parameters

## Features In this Implementation

- REST API endpoint for palindrome checking
- Case-insensitive checking
- Special character and space handling
- Multiple text processing options
- Rate limiting
- Input validation
- Docker support

### Run the server

```bash
npm start
# or for development with nodemon
npm run dev
```

### Example Requests

```bash
# Basic check
curl "http://localhost:3000/api/v1/palindrome?text=racecar"

# With options
curl "http://localhost:3000/api/v1/palindrome?text=A%20man,%20a%20plan,%20a%20canal:%20Panama&ignoreSpaces=false"

# Case sensitive check
curl "http://localhost:3000/api/v1/palindrome?text=Racecar&caseSensitive=true"
```

### Docker Support

- Docker File

```docker
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

## Why This Matters

- **Practical Applications:**

  - Word game validations
  - Data quality checks
  - Programming interview preparation
  - Language processing applications

- **Technical Showcase:**

  - Demonstrates clean API design
  - Shows configurable text processing
  - Implements security and rate-limiting
  - Follows REST best practices
