class EmailService {
  static async sendEmail(jobData) {
    // Simulate email sending
    console.log(`Sending email to: ${jobData.to}`);
    console.log(`Subject: ${jobData.subject}`);
    console.log(`Body: ${jobData.body}`);
    
    // Simulate random success/failure for demonstration
    const success = Math.random() > 0.2; // 80% success rate
    
    if (!success) {
      throw new Error('Failed to send email');
    }
    
    return { success: true, message: 'Email sent successfully' };
  }
}

module.exports = EmailService;