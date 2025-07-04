# TODO API _(No DB)_

Todo API implementation that uses in-memory storage instead of a database, perfect for testing and small projects.

## Features
- RESTful API endpoints
- In-memory data storage
- Data persistence via JSON file
- Input validation
- Error handling
- Sorting and filtering

## Key Features

- Data Persistence: Automatically saves to todos.json
- Validation: Ensures todos have titles
- Sorting: Sort by creation date or title
- Filtering: Filter by completion status
- Atomic Operations: Toggle completion with PATCH
- Bulk Delete: Remove all completed todos at once

## API Endpoints:

- Get all todos

```bash
GET /api/todos
Query params:
  - sort (createdAt|title)
  - order (asc|desc)
  - completed (true|false)
```

- Get single todo

```bash
GET /api/todos/:id
```

- Create todo

```bash
POST /api/todos
Body: { "title": "Task 1", "priority": "high" }
```

- Update todo

```bash
PUT /api/todos/:id
Body: { "title": "Updated Task", "completed": true }
```

- Toggle completion

```bash
PATCH /api/todos/:id/toggle
```

- Delete todo

```bash
DELETE /api/todos/:id
```

- Delete completed todos

```bash
DELETE /api/todos
```

## Testing with CURL

```bash
# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Node.js","priority":"high"}'

# Get all todos
curl http://localhost:3000/api/todos

# Toggle completion
curl -X PATCH http://localhost:3000/api/todos/1/toggle

# Delete a todo
curl -X DELETE http://localhost:3000/api/todos/1
```

## Future Enhancements

- Add user authentication
- Implement rate limiting
- Add tags/categories
- Add due dates and reminders
- Implement proper logging
- Add Swagger documentation
