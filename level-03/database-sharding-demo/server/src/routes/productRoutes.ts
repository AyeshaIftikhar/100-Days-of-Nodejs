import express from 'express';
import { productController } from '../controllers/productController';

const router = express.Router();

// Product routes
router.get('/', productController.getProducts);
router.get('/:productId', productController.getProductById);
router.post('/', productController.createProduct);

export default router;
