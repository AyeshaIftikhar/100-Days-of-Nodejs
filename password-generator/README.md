# 🗝️ Password Generator (CLI tool)

This is a secure password generator command-line tool built with Node.js that creates strong, random passwords with various customization options.

## Features

- Generates cryptographically secure passwords
- Customizable length (default: 16 characters)
- Option to include/exclude different character types:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- Copy to clipboard functionality
- Save passwords to a file with optional encryption
- Generate multiple passwords at once

## Key Interactive Features:

- Step-by-Step Prompts:
  - Password length selection with validation
  - Checkbox menu for character types
  - Number of passwords to generate
  - Clipboard and file save options
- Intuitive Interface:
  - Clear questions with default values
  - Input validation for all fields
  - Conditional questions (file path only appears if saving)
- Post-Generation Options:
  - Option to generate another password
  - Clear display before new generation
  - Friendly exit message
- Enhanced User Experience:
  - Color-coded success/error messages
  - Configuration summary
  - Numbered password list when generating multiple

## Example Interaction Flow:

- User runs the tool and sees the ASCII art banner
- Gets prompted for:
  - Password length (default: 16)
  - Character types (all selected by default)-
  - Number of passwords (default: 1)
  - Whether to copy to clipboard (default: yes)
  - Whether to save to file (default: no)
  - File path (if saving)
- Sees the generated password(s) in bold
- Gets feedback about clipboard copy and file save
- Sees a summary of the configuration used
- Gets asked if they want to generate another password

## Future Enhancements

- Password strength meter
- Option to exclude similar characters (e.g., i, l, 1, etc.)
- Password expiration reminders
- Integration with password managers
- QR code generation for easy mobile transfer

This tool provides a simple yet secure way to generate passwords directly from your command line while maintaining good security practices.
