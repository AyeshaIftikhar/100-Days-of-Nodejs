import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { generateProductId } from '../utils/generators';

export const productController = {
  // Get products with optional category filter
  async getProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;

      // Create a filter object if categoryId is provided
      const filter = categoryId ? { categoryId } : {};

      const products = await Product.find(filter)
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(filter);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const productId = req.params.productId;
      const product = await Product.findOne({ productId });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Create new product
  async createProduct(req: Request, res: Response) {
    try {
      const { name, description, price, categoryId, stock } = req.body;

      if (!name || !description || !price || !categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Please provide name, description, price, and categoryId',
        });
      }

      const productId = generateProductId();
      const product = await Product.create({
        productId,
        name,
        description,
        price,
        categoryId,
        stock: stock || 0,
      });

      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
};
