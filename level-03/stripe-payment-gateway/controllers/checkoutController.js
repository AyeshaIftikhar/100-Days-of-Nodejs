const stripe = require('../config/stripe');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Show checkout page
exports.getCheckout = async (req, res) => {
  try {
    // Assuming product ID is passed in the URL
    const { productId, quantity = 1 } = req.query;
    
    if (!productId) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Product ID is required',
        error: { status: 400 }
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'Product not found',
        error: { status: 404 }
      });
    }
    
    const amount = product.price * quantity;
    
    res.render('checkout', {
      title: 'Checkout',
      product,
      quantity,
      amount
    });
  } catch (error) {
    console.error('Error loading checkout page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading checkout page',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { productId, quantity, customerEmail } = req.body;
    
    if (!productId || !quantity || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, quantity, and customer email are required'
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const amount = Math.round(product.price * quantity * 100); // Convert to cents for Stripe
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: {
        product_id: productId,
        product_name: product.name,
        quantity
      }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Payment success
exports.paymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId, productId, quantity, customerName, customerEmail, customerAddress } = req.body;
    
    if (!paymentIntentId || !productId || !quantity || !customerName || !customerEmail || !customerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Create order in database
    const order = new Order({
      products: [{ product: productId, quantity }],
      totalAmount: product.price * quantity,
      paymentIntentId,
      status: 'completed',
      customer: {
        name: customerName,
        email: customerEmail,
        address: customerAddress
      }
    });
    
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error processing payment success:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Payment webhook handler
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Update order status if needed
      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: 'completed' }
      );
      
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('Payment failed:', failedPaymentIntent.id);
      
      // Update order status
      await Order.findOneAndUpdate(
        { paymentIntentId: failedPaymentIntent.id },
        { status: 'failed' }
      );
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};
