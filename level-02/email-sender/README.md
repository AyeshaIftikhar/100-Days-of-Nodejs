# Automated Email Sender with Nodemailer

A robust email sending system with templating and scheduling capabilities.

## Features

- **Email Templating**: Handlebars templates with variables
- **Scheduled Sending**: Send emails at specific times
- **Bulk Emails**: Send to multiple recipients
- **Tracking**: Log all sent emails
- **Template Management**: Store templates in database
- **Scheduled Jobs**: Automatic processing of pending emails

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- SMTP email service (Gmail, SendGrid, etc.)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Run the application: `npm run dev`

## API Endpoints

### Email Operations
- `POST /api/v1/emails` - Send a single email
- `POST /api/v1/emails/bulk` - Send multiple emails

### Template Management
- `POST /api/v1/emails/templates` - Create a new template
- `GET /api/v1/emails/templates` - Get all templates

## Email Request Format

```json
{
  "to": "recipient@example.com",
  "subject": "Your Subject Here",
  "template": "welcome",
  "context": {
    "name": "John Doe",
    "activationLink": "https://example.com/activate"
  },
  "scheduled": "2023-12-25T00:00:00Z" // Optional
}
```

```bash
npm install nodemailer express mongoose dotenv node-cron handlebars
npm install --save-dev nodemon
```