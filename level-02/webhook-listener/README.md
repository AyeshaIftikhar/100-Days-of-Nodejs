# Webhook Listener with Ngrok

## What is Ngrok 
ngrok is a globally distributed `reverse proxy` that secures, protects and accelerates your applications and network services, no matter where you run them. You can think of ngrok as the front door to your applications.

ngrok is environment independent because it can deliver traffic to services running anywhere with no changes to your environment's networking. Run your app on AWS, Azure, Heroku, an on-premise Kubernetes cluster, a Raspberry Pi, and even your laptop. With ngrok, it all works the same.

ngrok is a unified  ingress platform because it combines all the components to deliver traffic from your services to the internet into one. ngrok consolidates together your reverse proxy, load balancer, API gateway, firewall, delivery network, DDoS protection and more.

A local development webhook listener that can be exposed to the internet using Ngrok for testing webhook integrations.

## Features

- Receives and processes webhook events
- Supports signature verification (HMAC)
- Ngrok integration for public URLs
- Stores received events for debugging
- Simple API to view and clear events


### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Run the application: `npm run dev`

### Ngrok Setup

1. Sign up at [ngrok.com](https://ngrok.com/)
2. Get your auth token from the dashboard
3. Add it to your `.env` file as `NGROK_AUTH_TOKEN`

## API Endpoints

- `POST /webhook` - Main webhook endpoint
- `GET /webhook/events` - View received events (for debugging)
- `DELETE /webhook/events` - Clear stored events

## Webhook Configuration

To test with various services:

### GitHub Webhooks

1. Go to your repository Settings > Webhooks
2. Add a new webhook
3. Set Payload URL to your Ngrok URL (e.g., `https://abc123.ngrok.io/webhook`)
4. Set Content type to `application/json`
5. Add your secret (must match `WEBHOOK_SECRET` in `.env`)
6. Select events you want to receive

### Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add an endpoint with your Ngrok URL
3. Select events to listen to
4. Use the CLI to test: `stripe listen --forward-to localhost:3000/webhook`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NGROK_AUTH_TOKEN` - Your Ngrok authentication token
- `WEBHOOK_SECRET` - Secret for verifying webhook signatures

## Example Usage

1. Start the server: `npm run dev`
2. Ngrok will provide a public URL
3. Configure your service to send webhooks to this URL
4. View received events at `GET /webhook/events`

```json
[
  {
    "headers": {
      "x-github-event": "push",
      "x-hub-signature-256": "sha256=abc123..."
    },
    "body": {
      "ref": "refs/heads/main",
      "commits": [...]
    },
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
]


```bash
npm install express ngrok body-parser dotenv crypto
npm install --save-dev nodemon
```