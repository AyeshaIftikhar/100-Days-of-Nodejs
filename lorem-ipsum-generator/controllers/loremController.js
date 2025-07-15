const { LoremIpsum } = require('lorem-ipsum');

const generator = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

exports.generateLorem = (req, res) => {
  const { type = 'paragraphs', amount = 1 } = req.query;

  const count = parseInt(amount);

  if (isNaN(count) || count < 1 || count > 100) {
    return res.status(400).json({ error: 'Amount must be a number between 1 and 100' });
  }

  let result;
  switch (type) {
    case 'words':
      result = generator.generateWords(count);
      break;
    case 'sentences':
      result = generator.generateSentences(count);
      break;
    case 'paragraphs':
    default:
      result = generator.generateParagraphs(count);
      break;
  }

  res.json({
    type,
    amount: count,
    content: result
  });
};
