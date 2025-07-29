# File Encryption Tool with Node.js Crypto Module

A secure file encryption and decryption tool using AES-256-CBC encryption.

## Features

- **Strong Encryption**: AES-256-CBC algorithm
- **Password Protection**: PBKDF2 key derivation
- **File Management**: Encrypted file storage
- **Progress Tracking**: Real-time operation progress
- **Security**: Salt and IV generation
- **Logging**: Comprehensive operation logs

## API Endpoints

### Encryption
- `POST /api/v1/encrypt` - Encrypt a file
  - Requires: `file` (multipart form), `password` (form field)
- `POST /api/v1/encrypt/decrypt/:filename` - Decrypt a file
  - Requires: `password` (JSON body)

### File Management
- `GET /api/v1/files` - List all encrypted files
- `GET /api/v1/files/download/:filename` - Download encrypted file

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Run the application: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 3000)
- `STORAGE_PATH`: Path for encrypted file storage
- `ENCRYPTION_ALGORITHM`: Encryption algorithm (default: aes-256-cbc)
- `DEFAULT_IV_LENGTH`: Initialization vector length (default: 16)
- `MAX_FILE_SIZE_MB`: Maximum file size in MB (default: 50)
- `LOG_LEVEL`: Logging level (default: info)

## Security Considerations

- Always use strong passwords
- Keep your encryption password secure
- The tool does not store passwords
- Encrypted files contain salt and IV needed for decryption
- For maximum security, delete files after use

## Future Enhancements

1. Add file compression before encryption
2. Implement multi-file operations
3. Add client-side encryption in browser
4. Implement file sharing with expiration
5. Add two-factor authentication
6. Implement file integrity checks
7. Add support for different encryption algorithms
8. Implement secure file deletion

