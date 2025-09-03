const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('products/index', { 
      title: 'All Products',
      products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('error', { 
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).render('error', { 
        message: 'Product not found',
        error: { status: 404 }
      });
    }
    
    res.render('products/details', { 
      title: product.name,
      product 
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).render('error', { 
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    
    res.render('products/category', { 
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Products`,
      category,
      products 
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).render('error', { 
      message: 'Error fetching products by category',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Add a new product (for admin use)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category
    });
    
    await newProduct.save();
    
    res.status(201).json({ 
      success: true,
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
