# File Organizer CLI 📂

A Node.js command-line tool to automatically organize files in a directory by extension (e.g., `.jpg` → `/images`, `.pdf` → `/documents`).

## Features
- 🗂️ Categorizes files into folders by type
- ⚡ Supports 20+ file extensions out of the box
- 🔄 Safe file operations (no overwrites)
- 📝 Custom folder mapping support

## Quick Start

```bash
# Clone repo
git clone https://github.com/AyeshaIftikhar/file-organizer-cli.git
cd file-organizer-cli

# Install dependencies
npm install

# Run organizer (targets ./test-files by default)
node index.js --dir=./your-folder
```

### Setup Instructions:

#### 1. Install dependencies:

```bash
    npm install chalk commander
```

#### 2. Create the `config` folder:

```bash
    mkdir config
```

#### 3. Add `config/default.json`:

```json
{
  "images": ["jpg", "jpeg", "png", "gif", "svg"],
  "documents": ["pdf", "docx", "txt", "md", "csv"],
  "audio": ["mp3", "wav", "ogg"],
  "archives": ["zip", "rar", "tar", "gz"],
  "code": ["js", "json", "html", "css", "py"]
}
```
#### 4. Make it executable (Linux/Mac):

```bash
    chmod +x index.js
```

#### 5. Test it

```bash
# Dry run
node index.js --dir=../../../Downloads --dry 

# Real execution
node index.js --dir=../../../Downloads
```



