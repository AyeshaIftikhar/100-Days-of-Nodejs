const crypto = require('crypto');

class WebhookController {
  constructor() {
    this.events = [];
  }

  // Verify webhook signature (for GitHub example)
  verifySignature(req, secret) {
    const signature = req.headers['x-hub-signature-256'] || '';
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(
      'sha256=' + hmac.update(req.rawBody).digest('hex'),
      'utf8'
    );
    const checksum = Buffer.from(signature, 'utf8');
    
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
      throw new Error('Invalid signature');
    }
  }

  async handleWebhook(req, res) {
    try {
      // Store raw body for signature verification
      req.rawBody = JSON.stringify(req.body);

      // Verify signature if secret is provided
      if (process.env.WEBHOOK_SECRET) {
        this.verifySignature(req, process.env.WEBHOOK_SECRET);
      }

      // Process the webhook event
      const event = {
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString()
      };

      this.events.push(event);
      console.log('Received webhook event:', event);

      res.status(200).json({ status: 'success', message: 'Webhook received' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
    return { status: 'success', message: 'Events cleared' };
  }
}

module.exports = new WebhookController();