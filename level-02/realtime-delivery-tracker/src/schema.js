// src/schema.js
import { createSchema, createPubSub } from 'graphql-yoga';
import {
  createOrder,
  updateOrderStatus,
  updateCourierLocation,
  assignCourier,
  orders,
  seedDemo
} from './data.js';

const pubSub = createPubSub();

// Topics
const ORDER_UPDATED = 'ORDER_UPDATED';
const COURIER_LOCATION_UPDATED = 'COURIER_LOCATION_UPDATED';

seedDemo(); // seed one demo order on startup

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    enum OrderStatus {
      PLACED
      CONFIRMED
      PREPARING
      OUT_FOR_DELIVERY
      DELIVERED
      CANCELLED
    }

    type Item {
      name: String!
      qty: Int!
    }

    type Courier {
      id: ID!
      name: String!
    }

    type Location {
      lat: Float!
      lng: Float!
      updatedAt: String!
    }

    type Order {
      id: ID!
      customerName: String!
      items: [Item!]!
      status: OrderStatus!
      courier: Courier
      location: Location
      createdAt: String!
    }

    type Query {
      orders: [Order!]!
      order(id: ID!): Order
      health: String!
    }

    input ItemInput {
      name: String!
      qty: Int!
    }

    input CourierInput {
      id: ID!
      name: String!
    }

    input LocationInput {
      lat: Float!
      lng: Float!
    }

    type Mutation {
      createOrder(customerName: String!, items: [ItemInput!]!): Order!
      assignCourier(orderId: ID!, courier: CourierInput!): Order
      updateOrderStatus(orderId: ID!, status: OrderStatus!): Order
      updateCourierLocation(orderId: ID!, location: LocationInput!): Order
    }

    type Subscription {
      orderUpdated(orderId: ID): Order!
      courierLocationUpdated(orderId: ID!): Location!
    }
  `,
  resolvers: {
    Query: {
      orders: () => Array.from(orders.values()),
      order: (_, { id }) => orders.get(id) || null,
      health: () => 'ok'
    },
    Mutation: {
      createOrder: async (_, { customerName, items }) => {
        const order = createOrder({ customerName, items });
        await pubSub.publish(ORDER_UPDATED, { orderUpdated: order });
        return order;
      },
      assignCourier: async (_, { orderId, courier }) => {
        const updated = assignCourier(orderId, courier);
        if (updated) {
          await pubSub.publish(ORDER_UPDATED, { orderUpdated: updated });
        }
        return updated;
      },
      updateOrderStatus: async (_, { orderId, status }) => {
        const updated = updateOrderStatus(orderId, status);
        if (updated) {
          await pubSub.publish(ORDER_UPDATED, { orderUpdated: updated });
        }
        return updated;
      },
      updateCourierLocation: async (_, { orderId, location }) => {
        const updated = updateCourierLocation(orderId, location);
        if (updated?.location) {
          await pubSub.publish(COURIER_LOCATION_UPDATED, {
            courierLocationUpdated: updated.location,
            orderId
          });
        }
        return updated;
      }
    },
    Subscription: {
      orderUpdated: {
        // Optional filter: if orderId is provided, only push that order
        subscribe: (_, { orderId }) =>
          pubSub.subscribe(ORDER_UPDATED, {
            filter: (payload) => {
              if (!orderId) return true;
              return payload.orderUpdated.id === orderId;
            }
          })
      },
      courierLocationUpdated: {
        subscribe: (_, { orderId }) =>
          pubSub.subscribe(COURIER_LOCATION_UPDATED, {
            filter: (_, context) => {
              // context.payload contains { courierLocationUpdated, orderId }
              return context.payload.orderId === orderId;
            }
          })
      }
    }
  }
});
