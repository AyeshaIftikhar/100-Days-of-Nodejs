# Email Extractor _(Regex & FS)_

Email extractor that scans files and directories for email addresses using regular expressions and the file system module.

## Features
- Recursive directory scanning
- Multiple file type support (.txt, .html, .js, etc.)
- Email validation with regex
- Results deduplication
- Output to console or file
- Progress reporting
- Configurable options

### Run the extractor
```bash
# Basic usage
node email-extractor.js -i ./path/to/scan

# With output file
node email-extractor.js -i ./path/to/scan -o emails.txt

# Non-recursive scan
node email-extractor.js -i ./path/to/scan --no-recursive

# Verbose mode
node email-extractor.js -i ./path/to/scan -v
```

## Key Features

- Comprehensive Email Regex: Matches virtually all valid email formats
- Recursive Directory Scanning: Processes nested directories
- File Type Filtering: Only scans supported text-based files
- Progress Reporting: Shows scan progress in real-time
- Deduplication: Returns only unique email addresses
- Output Options: Can print to console or save to file
- Error Handling: Gracefully handles unreadable files