# File Uploader with Multipart Forms

file uploader implementation using Node.js with Express and Multer for handling multipart/form-data uploads.

## Features

- Multiple file uploads
- File type filtering
- Size limits
- Progress tracking
- Secure file handling
- Temporary upload storage
- Automatic cleanup
- REST API endpoints

- Single File Upload
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.jpg"
```

- Mutliple Files Upload
```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -H "Content-Type: multipart/form-data" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.pdf"
```

- Download a file
```bash
curl -OJ http://localhost:3000/api/upload/download/filename.jpg
```