# 🔗 URL Shortener

```
url-shortener/
├── db/
│   └── urls.json        # File-based database
├── models/
│   └── urlModel.js      # Data model and storage handling
├── routes/
│   └── urlRoutes.js     # API routes
├── utils/
│   ├── config.js        # Configuration
│   └── helpers.js       # Helper functions
├── app.js               # Main application
└── package.json
```

## Features
- File-based database (no external DB required)
- Unique short code generation
- URL validation
- Click tracking
- Simple REST API

## Endpoints
- POST api/shorten - Create a short URL

```json
{
  "originalUrl": "https://example.com/very/long/url"
}```
Response:

```json
{
    "success": true,
    "message": "URL shortened successfully!",
    "data": {
        "originalUrl": "https://github.com/AyeshaIftikhar",
        "shortUrl": "http://localhost:3000/Q8H18b",
        "shortCode": "Q8H18b"
    }
}
```


- GET api/abc123 - Redirect to original URL

## Limitations

- File-based storage isn't suitable for high-traffic production use
- No user authentication
- No analytics beyond click count
- No expiration for shortened URLs

For production use, you might want to:

- Replace the file-based DB with a proper database (MongoDB, PostgreSQL, etc.)
- Add rate limiting
- Implement authentication
- Add more analytics
- Set up proper logging