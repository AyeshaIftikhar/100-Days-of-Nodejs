# Stripe Payment Gateway Integration

A complete Node.js application demonstrating Stripe payment gateway integration for e-commerce websites. This project provides a secure and scalable solution for processing online payments using Stripe's powerful API.

## Features

- 🔒 Secure payment processing with Stripe
- 💳 Credit/debit card payments
- 📱 Responsive design for mobile and desktop
- 📦 Product catalog and details
- 🧾 Order tracking and management
- 💰 Real-time payment confirmation
- 🔔 Webhook integration for payment events

## Prerequisites

- Node.js (v14+)
- MongoDB
- Stripe account (for API keys)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stripe-payment-gateway
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/stripe-payment-gateway
   SESSION_SECRET=your_session_secret_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   ```

4. Seed the database with sample products:
   ```bash
   node seed.js
   ```

5. Start the application:
   ```bash
   npm start
   ```

6. For development with auto-restart:
   ```bash
   npm run dev
   ```

7. Access the application at `http://localhost:3000`

## Setting Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com) if you don't have one
2. Navigate to the Developers section of your Stripe dashboard
3. Get your API keys (publishable and secret keys)
4. For webhook testing locally, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/checkout/webhook
   ```
5. Copy the webhook signing secret to your `.env` file

## Project Structure

```
stripe-payment-gateway/
├── config/            # Configuration files
├── controllers/       # Route controllers
├── models/            # Database models
├── public/            # Static assets
│   ├── css/           # Stylesheets
│   └── js/            # Client-side JavaScript
├── routes/            # Express routes
├── views/             # EJS templates
├── .env               # Environment variables
├── app.js             # Application entry point
├── package.json       # Project dependencies
└── seed.js            # Database seeding script
```

## Usage

1. Browse products on the home page
2. Click on a product to view details
3. Add products to cart and proceed to checkout
4. Fill in shipping and payment information
5. Complete the payment using Stripe
6. View your order confirmation

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment Processing**: Stripe API
- **Frontend**: EJS templates, Bootstrap 5, JavaScript
- **Authentication**: Express sessions

## Security Features

- PCI-compliant payment processing via Stripe Elements
- HTTPS support for secure connections
- Payment data never touches your server
- CSRF protection built-in
- Input validation and sanitization

## Future Enhancements

1. **User Authentication**
   - Implement user registration and login
   - User profile management
   - Order history for registered users

2. **Payment Methods**
   - Add support for additional payment methods (Apple Pay, Google Pay)
   - Implement subscriptions and recurring payments
   - Support for international payments and currencies

3. **Shopping Cart**
   - Persistent shopping cart functionality
   - Multi-item checkout process
   - Saved payment methods for return customers

4. **Admin Dashboard**
   - Order management interface
   - Product management CRUD operations
   - Sales analytics and reporting

5. **Discount and Coupon System**
   - Create and manage discount codes
   - Implement automatic promotions
   - Support for percentage and fixed amount discounts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Stripe for their excellent payment API and documentation
- Express.js community for the robust web framework
- MongoDB for the flexible database solution
