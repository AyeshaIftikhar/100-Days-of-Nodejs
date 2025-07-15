function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

exports.rollDice = (req, res) => {
  const { sides = 6, count = 1 } = req.query;

  const numSides = parseInt(sides);
  const numDice = parseInt(count);

  if (isNaN(numSides) || isNaN(numDice) || numSides < 2 || numDice < 1) {
    return res.status(400).json({ error: 'Invalid parameters. Use sides >= 2 and count >= 1.' });
  }

  const rolls = Array.from({ length: numDice }, () => rollDie(numSides));
  const total = rolls.reduce((sum, roll) => sum + roll, 0);

  res.json({
    sides: numSides,
    count: numDice,
    rolls,
    total,
    timestamp: new Date().toISOString()
  });
};
