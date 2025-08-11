class EmailJob {
  constructor(data) {
    this.to = data.to;
    this.subject = data.subject;
    this.body = data.body;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      to: this.to,
      subject: this.subject,
      body: this.body,
      timestamp: this.timestamp
    };
  }
}

module.exports = EmailJob;