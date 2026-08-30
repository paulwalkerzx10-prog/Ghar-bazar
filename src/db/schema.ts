import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  address: text('address'),
  addresses: jsonb('addresses').default([]),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  icon_url: text('icon_url'),
  display_order: integer('display_order').default(0),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  price: integer('price').notNull(),
  unit: text('unit').notNull(),
  image_url: text('image_url'),
  in_stock: boolean('in_stock').default(true).notNull(),
  description: text('description'),
});

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  image_url: text('image_url').notNull(),
  link_url: text('link_url'),
  is_active: boolean('is_active').default(true).notNull(),
  display_order: integer('display_order').default(0),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => customers.uid).notNull(),
  customer_name: text('customer_name').notNull(),
  phone_number: text('phone_number').notNull(),
  address: text('address').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  delivery_slot: text('delivery_slot').notNull(),
  status: text('status').default('Placed').notNull(),
  total_amount: integer('total_amount').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const order_items = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  price_at_order: integer('price_at_order').notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(order_items),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(order_items),
}));

export const orderItemsRelations = relations(order_items, ({ one }) => ({
  order: one(orders, {
    fields: [order_items.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [order_items.productId],
    references: [products.id],
  }),
}));
