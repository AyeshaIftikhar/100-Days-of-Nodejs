# Base64 Encoder/Decoder

Base64 encoding/decoding solution with both CLI and API interfaces.

## Features

- Encode strings to Base64
- Decode Base64 to strings
- File support (encode/decode files)
- URL-safe encoding option
- Command line interface
- REST API interface
- Input validation
- Error handling

- Install Globally

```bash
npm install -g ./path-to-base64-tool
```

- Encoding/Decoding Strings:

```bash
# Encode
base64 encode "Hello World"

# Decode
base64 decode "SGVsbG8gV29ybGQ="

# URL-safe encoding
base64 encode "Hello World" --url-safe

# With file input/output
base64 encode input.txt --file -o encoded.txt
base64 decode encoded.txt --file -o output.txt
```

### API Usage

- Start the server

```bash
npm start
```

- Make Requests

```bash
# Encode
curl -X POST http://localhost:3000/api/encode \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World"}'

# Decode
curl -X POST http://localhost:3000/api/decode \
  -H "Content-Type: application/json" \
  -d '{"encoded":"SGVsbG8gV29ybGQ="}'

# File operations (path must be server-accessible)
curl -X POST http://localhost:3000/api/encode/file \
  -H "Content-Type: application/json" \
  -d '{"filePath":"/path/to/file.txt"}'
```

## Advanced Usage

- For production use, you might want to:
- Add authentication to the API
- Implement proper file uploads (using multer)
- Add logging
- Containerize with Docker
- Add Swagger documentation
- Implement caching for frequent requests
