// src/types.d.ts
export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface Item {
  name: string;
  qty: number;
}

export interface Courier {
  id: string;
  name: string;
}

export interface Location {
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: Item[];
  status: OrderStatus;
  courier?: Courier | null;
  location?: Location | null;
  createdAt: string;
}
