/**
 * Simulates a domain service—e.g., order creation—that may succeed or fail.
 * Logs are emitted by routes (with correlationId) so traces line up.
 */

async function processOrder({ userId, items }) {
  // Simulate doing some work…
  await new Promise((r) => setTimeout(r, Math.random() * 200 + 50));

  if (!items || items.length === 0) {
    const err = new Error('No items provided');
    err.code = 'NO_ITEMS';
    err.status = 400;
    throw err;
  }

  if (Math.random() < 0.15) {
    const err = new Error('Randomized payment processor failure');
    err.code = 'PAYMENT_GATEWAY';
    err.status = 502;
    throw err;
  }

  return {
    orderId: Math.random().toString(36).slice(2, 10),
    userId,
    itemCount: items.length,
    total: items.length * 9.99
  };
}

module.exports = { processOrder };
