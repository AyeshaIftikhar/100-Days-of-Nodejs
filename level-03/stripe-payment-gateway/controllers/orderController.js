const Order = require('../models/Order');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.render('orders/index', {
      title: 'All Orders',
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).render('error', {
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product');
    
    if (!order) {
      return res.status(404).render('error', {
        message: 'Order not found',
        error: { status: 404 }
      });
    }
    
    res.render('orders/details', {
      title: `Order #${order._id}`,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).render('error', {
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get orders by customer email
exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ 'customer.email': email })
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.render('orders/customer', {
      title: `Orders for ${email}`,
      customerEmail: email,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).render('error', {
      message: 'Error fetching customer orders',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
