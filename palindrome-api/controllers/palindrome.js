class PalindromeController {
  static checkPalindrome(text, options) {
    // Validate input
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Input must be a non-empty string');
    }

    // Apply processing based on options
    let processedText = text;

    if (!options.caseSensitive) {
      processedText = processedText.toLowerCase();
    }

    if (options.ignoreSpaces) {
      processedText = processedText.replace(/\s+/g, '');
    }

    if (options.ignoreSpecialChars) {
      processedText = processedText.replace(/[^a-zA-Z0-9]/g, '');
    }

    // Check if palindrome
    const reversedText = processedText.split('').reverse().join('');
    return processedText === reversedText;
  }

  static check(req, res) {
    try {
      const { text } = req.query;
      const options = {
        ignoreSpaces: req.query.ignoreSpaces !== 'false',
        ignoreSpecialChars: req.query.ignoreSpecialChars !== 'false',
        caseSensitive: req.query.caseSensitive === 'true'
      };

      const isPalindrome = this.checkPalindrome(text, options);

      res.json({
        text,
        isPalindrome,
        optionsUsed: options
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PalindromeController;