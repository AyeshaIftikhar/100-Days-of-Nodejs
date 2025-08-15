// src/data.js
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

/**
 * In-memory data store (replace with DB in production).
 */
export const orders = new Map();
/**
 * Order shape:
 * {
 *   id: string,
 *   customerName: string,
 *   items: [{ name: string, qty: number }],
 *   status: "PLACED" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED",
 *   courier: { id: string, name: string } | null,
 *   location: { lat: number, lng: number, updatedAt: string } | null,
 *   createdAt: string
 * }
 */

export function createOrder({ customerName, items }) {
  const id = nanoid();
  const order = {
    id,
    customerName,
    items,
    status: 'PLACED',
    courier: null,
    location: null,
    createdAt: new Date().toISOString()
  };
  orders.set(id, order);
  return order;
}

export function updateOrderStatus(id, status) {
  const order = orders.get(id);
  if (!order) return null;
  order.status = status;
  orders.set(id, order);
  return order;
}

export function assignCourier(id, courier) {
  const order = orders.get(id);
  if (!order) return null;
  order.courier = courier;
  orders.set(id, order);
  return order;
}

export function updateCourierLocation(id, location) {
  const order = orders.get(id);
  if (!order) return null;
  order.location = { ...location, updatedAt: new Date().toISOString() };
  orders.set(id, order);
  return order;
}

export function seedDemo() {
  const demo = createOrder({
    customerName: 'Ayesha I.',
    items: [
      { name: 'Latte', qty: 1 },
      { name: 'Blueberry Muffin', qty: 2 }
    ]
  });
  assignCourier(demo.id, { id: 'CR-101', name: 'Sara Khan' });
  updateOrderStatus(demo.id, 'CONFIRMED');
  return demo;
}
