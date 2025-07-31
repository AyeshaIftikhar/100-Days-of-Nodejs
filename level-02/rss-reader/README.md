# RSS Feed Reader

A complete RSS and Atom feed reader with subscription management and automatic updates.

## Features

- **Feed Discovery**: Add new feeds by URL
- **Subscription Management**: Organize feeds with categories
- **Automatic Updates**: Regular feed fetching
- **Read Status**: Mark items as read/unread
- **Pagination**: Efficient loading of feed items
- **Rate Limiting**: Prevent abuse of the API
- **Comprehensive Logging**: Track all operations

## API Endpoints

### Feed Management
- `POST /api/v1/feeds/discover` - Discover and validate a feed
- `GET /api/v1/feeds/:feedId/items` - Get items from a specific feed
- `PATCH /api/v1/feeds/items/:itemId/read` - Mark item as read

### Subscription Management
- `POST /api/v1/subscriptions` - Subscribe to a feed
- `GET /api/v1/subscriptions` - List all subscriptions
- `DELETE /api/v1/subscriptions/:subscriptionId` - Unsubscribe from a feed

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Run the application: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `FETCH_INTERVAL`: Feed update interval in minutes (default: 30)
- `MAX_FEEDS_PER_USER`: Maximum subscriptions per user (default: 50)
- `REQUEST_TIMEOUT`: HTTP request timeout in ms (default: 10000)
- `USER_AGENT`: User agent string for feed requests

## Future Enhancements

1. Add OPML import/export
2. Implement feed search functionality
3. Add user preferences for feed display
4. Implement feed item filtering
5. Add sharing functionality
6. Implement offline reading mode
7. Add push notifications for new items
8. Implement API key authentication

