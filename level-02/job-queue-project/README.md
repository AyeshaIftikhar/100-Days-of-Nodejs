# Job Queue with Bull and Redis

A complete implementation of a job queue system using Bull and Redis in Node.js.

## Features

- Job queue with Redis backend
- Job processing with retry logic
- Error handling and logging
- API endpoint for adding jobs
- Monitoring and event listeners

## Prerequisites

- Node.js (v14 or higher)
- Redis server running locally or accessible
- npm or yarn

## API Endpoints
- POST /api/emails - Add an email job to the queue

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "body": "This is a test email"
}
```
- GET /health - Health check endpoint

```
curl -X POST http://localhost:3000/api/emails \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","subject":"Test","body":"Hello World"}'
```