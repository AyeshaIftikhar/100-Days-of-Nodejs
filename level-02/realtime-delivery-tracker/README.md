# Realtime Delivery Tracker – GraphQL Subscriptions

A complete Node.js GraphQL server that provides **real-time order tracking**:
- **Subscriptions** for `orderUpdated` (status/courier changes) and `courierLocationUpdated` (GPS updates).
- **Mutations** to create orders, assign couriers, update status, and push courier GPS locations.
- **Queries** to fetch orders/order details.

Built with **graphql-yoga** (WebSocket + SSE subscriptions) and Node.js ≥ 18.

## Features

- **Orders**: create, view, and update.
- **Realtime status**: PLACED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED (or CANCELLED).
- **Realtime location**: push courier `lat/lng` updates and stream them to subscribers.

## Tech

- Node.js ≥ 18
- graphql-yoga ^5
- graphql ^16
- nanoid for IDs
- In-memory store (swap for DB in production)

## Getting Started

```bash
# 1) Clone or copy this project
# 2) Install dependencies
npm install

# 3) Run (dev)
npm run dev

# Or run (prod)
npm start
```
Server runs at: `http://localhost:4000/graphql`

GraphiQL is enabled with subscription support. Open the URL above in your browser.

## Example Usage
1) Subscribe to a specific order’s updates

First, find an order ID (the server seeds one demo order). In a separate tab, run:
```bash 
query {
  orders {
    id
    customerName
    status
  }
}
```
Pick an id from the response, then:

```bash
subscription OnOrderUpdated($orderId: ID) {
  orderUpdated(orderId: $orderId) {
    id
    status
    courier { id name }
    location { lat lng updatedAt }
  }
}
```

Variables:

```bash
{ "orderId": "PUT_ORDER_ID_HERE" }
```

2) Subscribe to courier GPS updates
```bash
subscription OnCourierLocation($orderId: ID!) {
  courierLocationUpdated(orderId: $orderId) {
    lat
    lng
    updatedAt
  }
}
```


Variables:
```bash
{ "orderId": "PUT_ORDER_ID_HERE" }
```

3) Create a new order
```bash
mutation {
  createOrder(
    customerName: "Zaynab"
    items: [{ name: "Cappuccino", qty: 1 }, { name: "Bagel", qty: 2 }]
  ) {
    id
    status
    createdAt
  }
}
```

4) Assign a courier
```bash
mutation {
  assignCourier(
    orderId: "PUT_ORDER_ID_HERE"
    courier: { id: "CR-202", name: "Ali Raza" }
  ) {
    id
    courier { id name }
    status
  }
}
```

5) Update order status
```bash
mutation {
  updateOrderStatus(orderId: "PUT_ORDER_ID_HERE", status: OUT_FOR_DELIVERY) {
    id
    status
  }
}
```

6) Push courier GPS location

Run this repeatedly (simulate a moving driver):
```bash
mutation {
  updateCourierLocation(
    orderId: "PUT_ORDER_ID_HERE"
    location: { lat: 24.8615, lng: 67.0099 }
  ) {
    id
    location { lat lng updatedAt }
  }
}
```


Subscribers of courierLocationUpdated will receive each new coordinate.

## Environment

- PORT (optional): default 4000.
- Create a .env if needed and pass values via your process manager or shell.

## Production Tips

- Replace the in-memory store with Postgres/MongoDB.
- Use a proper PubSub backed by Redis or NATS for horizontal scaling.
- Put the server behind a reverse proxy (NGINX) and enable TLS.
- Consider connection auth (API keys/JWT) for subscriptions.

## Testing

- Manual testing via GraphiQL (built-in).
- For automated tests, add vitest or jest and test resolvers independently.

## Future Enhancements

- Persist data in a database (Prisma + Postgres).
- Add JWT auth; scope subscriptions to the user’s orders.
- Add rate-limiting for mutation bursts (location spam).
- Add geofencing & ETA calculation (Haversine + speed).
- Add delivery events timeline with audit logs.
- Webhook/event bridge to notify external systems on status changes.
- Client example (React/Next.js) with graphql-ws or @apollo/client.