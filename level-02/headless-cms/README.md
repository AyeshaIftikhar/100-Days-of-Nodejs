## What is a Headless CMS?

A Headless CMS is a content management system that provides backend-only content management, making content accessible via APIs for display on any device. Unlike traditional CMS platforms (like WordPress), it separates the content repository (the "body") from the presentation layer (the "head").

## Key Characteristics:

- API-first architecture: Content is delivered via REST or GraphQL APIs
- Omnichannel ready: Same content can power websites, mobile apps, IoT devices
- Frontend agnostic: Works with any frontend framework (React, Vue, etc.)
- Developer friendly: Focuses purely on content structure and delivery

## Benefits:

- Flexibility: Choose any frontend technology
- Scalability: Handle high traffic loads efficiently
- Future-proof: Adapt to new devices/channels easily
- Better performance: No frontend bloat
- Improved security: Reduced attack surface

### Authentication

All endpoints (except public routes) require a JWT token in the Authorization header:
Authorization: Bearer <your-token>

### Content Types

#### Create Content Type

`POST /content/types`

**Request Body**:

```json
{
  "name": "Article",
  "description": "Blog articles",
  "fields": [
    {
      "name": "title",
      "type": "String",
      "required": true
    },
    {
      "name": "content",
      "type": "Text",
      "required": true
    },
    {
      "name": "published",
      "type": "Boolean",
      "default": false
    }
  ]
}
```

## Content Items

## Create Item

`POST /content/:contentType`

```
Example: POST /content/Article
```

Request Body:

```json
{
  "title": "Hello World",
  "content": "This is my first article",
  "published": true
}
```

## Get Items

`GET /content/:contentType`

Query Parameters:

```
limit: Number of items to return

skip: Number of items to skip

sort: Field to sort by (-field for descending)

Any field from your content type for filtering
```

```
Example: GET /content/Article?published=true&limit=10
```

```bash
Get Single Item
GET /content/:contentType/:id

Update Item
PUT /content/:contentType/:id

Delete Item
DELETE /content/:contentType/:id
```

## Docker file
```
docker build -t headless-cms .
docker run -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017/headless-cms headless-cms
```