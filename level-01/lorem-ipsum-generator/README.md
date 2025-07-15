# Lorem Ipsum Generator

The Lorem Ipsum Generator API provides dynamically generated placeholder text in the classic "Lorem Ipsum" format. It’s useful for designers, developers, and content creators who need dummy text for UI/UX mockups, templates, or wireframes.

## Features

- Generate custom number of paragraphs, sentences, or words
- Fast RESTful API
- Easily pluggable into frontends or CMS
- Lightweight, no database required


## 📌 Endpoints

**GET** `/api/lorem/generate`

### 🔧 Query Parameters

| Parameter | Type   | Description                              | Default      |
|-----------|--------|------------------------------------------|--------------|
| type      | string | `words`, `sentences`, or `paragraphs`    | paragraphs   |
| amount    | number | Number of items to generate (max: 100)   | 1            |

### 🔄 Examples

- `/api/lorem/generate?type=words&amount=10`
- `/api/lorem/generate?type=paragraphs&amount=2`

### ✅ Sample Response

```json
{
  "type": "words",
  "amount": 10,
  "content": "Lorem ipsum dolor sit amet consectetur adipiscing elit."
}
```

## 🚀 Future Enhancements

| Feature                         | Description |
|----------------------------------|-------------|
| 🌐 HTML/Markdown formatting      | Return text as HTML or Markdown |
| 📁 Download output               | Allow `.txt` or `.md` downloads |
| 📦 JSONP & CORS support          | Allow public API integrations |
| 🔢 Preset templates              | E.g., "title + paragraph", "blog post" |
| 💡 Random topic content          | Optionally use real topic keywords |
| 📊 Stats Dashboard               | Show usage metrics for devs |
| 💬 Multilingual lorem ipsum      | Spanish, French, etc. |
| ⚙️ Rate limiting & API keys      | For public use cases |
| 🌐 Frontend Client               | UI to test and copy generated text |