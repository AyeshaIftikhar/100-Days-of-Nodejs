import mongoose from 'mongoose';

// Types for Product model
export interface IProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
