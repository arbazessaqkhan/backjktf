var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// index.ts
import cors from "cors";
import express2 from "express";

// routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cart: () => cart,
  contacts: () => contacts,
  insertCartSchema: () => insertCartSchema,
  insertContactSchema: () => insertContactSchema,
  insertInventorySchema: () => insertInventorySchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPageViewSchema: () => insertPageViewSchema,
  insertProductSchema: () => insertProductSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertShowcaseImageSchema: () => insertShowcaseImageSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisitorSchema: () => insertVisitorSchema,
  inventory: () => inventory,
  messages: () => messages,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orders: () => orders,
  pageViews: () => pageViews,
  products: () => products,
  settings: () => settings,
  showcaseImages: () => showcaseImages,
  users: () => users,
  visitors: () => visitors
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("customer"),
  // customer, admin
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // early, small, stock
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  images: json("images").$type().default([]),
  specifications: json("specifications").$type(),
  isActive: boolean("is_active").notNull().default(true),
  weight: text("weight").notNull(),
  // e.g., "25kg", "50kg"
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: json("shipping_address").$type().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // pending, confirmed, shipped, delivered, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending, paid, failed
  paymentMethod: text("payment_method"),
  // card, bank_transfer, cod
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull()
});
var cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  movementType: text("movement_type").notNull(),
  // in, out, adjustment
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"),
  // order ID, adjustment ID, etc.
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var showcaseImages = pgTable("showcase_images", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  fromAdmin: boolean("from_admin").notNull().default(false),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  // info, warning, error, success
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  visitedPages: text("visited_pages").array(),
  timeOnSite: integer("time_on_site"),
  isReturning: boolean("is_returning").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  visitorId: integer("visitor_id").references(() => visitors.id),
  page: text("page").notNull(),
  title: text("title"),
  timeSpent: integer("time_spent"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true
});
var insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var insertCartSchema = createInsertSchema(cart).omit({
  id: true,
  createdAt: true
});
var insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true
});
var insertShowcaseImageSchema = createInsertSchema(showcaseImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true
});
var insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  timestamp: true
});

// db.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// storage.ts
import { eq, desc, and, sql } from "drizzle-orm";
var DatabaseStorage = class {
  // User management
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Contact management
  async createContact(insertContact) {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }
  async getContacts() {
    const contactList = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    return contactList;
  }
  // Product management
  async getProducts() {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(insertProduct) {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }
  async updateProduct(id, updateData) {
    const result = await db.update(products).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
  }
  // Order management
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || void 0;
  }
  async createOrder(insertOrder) {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }
  async updateOrderStatus(id, status) {
    const [order] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return order;
  }
  async getOrderItems(orderId) {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async createOrderItem(insertOrderItem) {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }
  // Cart management
  async getCartItems(sessionId) {
    return await db.select().from(cart).where(eq(cart.sessionId, sessionId));
  }
  async addToCart(insertCart) {
    const [existingItem] = await db.select().from(cart).where(and(eq(cart.sessionId, insertCart.sessionId), eq(cart.productId, insertCart.productId)));
    if (existingItem) {
      const [updated] = await db.update(cart).set({ quantity: existingItem.quantity + insertCart.quantity }).where(eq(cart.id, existingItem.id)).returning();
      return updated;
    } else {
      const [cartItem] = await db.insert(cart).values(insertCart).returning();
      return cartItem;
    }
  }
  async updateCartItem(id, quantity) {
    const [cartItem] = await db.update(cart).set({ quantity }).where(eq(cart.id, id)).returning();
    return cartItem;
  }
  async removeFromCart(id) {
    await db.delete(cart).where(eq(cart.id, id));
  }
  async clearCart(sessionId) {
    await db.delete(cart).where(eq(cart.sessionId, sessionId));
  }
  // Inventory management
  async getInventoryMovements(productId) {
    if (productId) {
      return await db.select().from(inventory).where(eq(inventory.productId, productId)).orderBy(desc(inventory.createdAt));
    }
    return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  }
  async createInventoryMovement(insertInventory) {
    const [movement] = await db.insert(inventory).values(insertInventory).returning();
    return movement;
  }
  async updateProductStock(productId, quantity) {
    await db.update(products).set({ stockQuantity: quantity, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, productId));
  }
  // Showcase image management
  async getShowcaseImages() {
    return await db.select().from(showcaseImages).orderBy(showcaseImages.order, desc(showcaseImages.createdAt));
  }
  async getShowcaseImage(id) {
    const [image] = await db.select().from(showcaseImages).where(eq(showcaseImages.id, id));
    return image;
  }
  async createShowcaseImage(insertImage) {
    const [image] = await db.insert(showcaseImages).values(insertImage).returning();
    return image;
  }
  async updateShowcaseImage(id, updateData) {
    const [image] = await db.update(showcaseImages).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(showcaseImages.id, id)).returning();
    return image;
  }
  async deleteShowcaseImage(id) {
    await db.delete(showcaseImages).where(eq(showcaseImages.id, id));
  }
  // Messaging system
  async getMessages(contactId) {
    if (contactId) {
      return await db.select().from(messages).where(eq(messages.contactId, contactId)).orderBy(desc(messages.createdAt));
    }
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }
  async createMessage(insertMessage) {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  async markMessageAsRead(id) {
    const [message] = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning();
    return message;
  }
  async getContactWithMessages(contactId) {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
    if (!contact) return void 0;
    const contactMessages = await this.getMessages(contactId);
    return { ...contact, messages: contactMessages };
  }
  // Notifications
  async getNotifications() {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }
  async createNotification(insertNotification) {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  async markNotificationAsRead(id) {
    const [notification] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return notification;
  }
  // Settings
  async getSettings() {
    return await db.select().from(settings);
  }
  async getSetting(key) {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }
  async updateSetting(key, value) {
    const existing = await this.getSetting(key);
    if (existing) {
      const [setting] = await db.update(settings).set({ value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settings.key, key)).returning();
      return setting;
    } else {
      const [setting] = await db.insert(settings).values({ key, value }).returning();
      return setting;
    }
  }
  // Visitor Analytics implementation
  async createVisitor(insertVisitor) {
    const result = await db.insert(visitors).values(insertVisitor).returning();
    return result[0];
  }
  async getVisitors() {
    return await db.select().from(visitors).orderBy(desc(visitors.createdAt));
  }
  async updateVisitor(id, updateData) {
    const result = await db.update(visitors).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(visitors.id, id)).returning();
    return result[0];
  }
  async createPageView(insertPageView) {
    const result = await db.insert(pageViews).values(insertPageView).returning();
    return result[0];
  }
  async getPageViews(visitorId) {
    if (visitorId) {
      return await db.select().from(pageViews).where(eq(pageViews.visitorId, visitorId)).orderBy(desc(pageViews.timestamp));
    }
    return await db.select().from(pageViews).orderBy(desc(pageViews.timestamp));
  }
  async getAnalyticsData() {
    const totalVisitorsResult = await db.select({ count: sql`count(*)` }).from(visitors);
    const totalVisitors = totalVisitorsResult[0]?.count || 0;
    const uniqueVisitorsResult = await db.select({ count: sql`count(*)` }).from(visitors).where(eq(visitors.isReturning, false));
    const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;
    const pageViewsResult = await db.select({ count: sql`count(*)` }).from(pageViews);
    const pageViewsCount = pageViewsResult[0]?.count || 0;
    const avgTimeResult = await db.select({ avg: sql`avg(time_on_site)` }).from(visitors).where(sql`time_on_site IS NOT NULL`);
    const avgTimeOnSite = Math.round(avgTimeResult[0]?.avg || 0);
    const topPagesResult = await db.select({
      page: pageViews.page,
      views: sql`count(*)`
    }).from(pageViews).groupBy(pageViews.page).orderBy(sql`count(*) desc`).limit(10);
    const countryResult = await db.select({
      country: visitors.country,
      count: sql`count(*)`
    }).from(visitors).where(sql`country IS NOT NULL`).groupBy(visitors.country).orderBy(sql`count(*) desc`).limit(10);
    const deviceResult = await db.select({
      device: visitors.device,
      count: sql`count(*)`
    }).from(visitors).where(sql`device IS NOT NULL`).groupBy(visitors.device).orderBy(sql`count(*) desc`);
    const browserResult = await db.select({
      browser: visitors.browser,
      count: sql`count(*)`
    }).from(visitors).where(sql`browser IS NOT NULL`).groupBy(visitors.browser).orderBy(sql`count(*) desc`);
    return {
      totalVisitors,
      uniqueVisitors,
      pageViews: pageViewsCount,
      avgTimeOnSite,
      topPages: topPagesResult.map((r) => ({ page: r.page, views: r.views })),
      visitorsByCountry: countryResult.map((r) => ({ country: r.country || "Unknown", count: r.count })),
      deviceStats: deviceResult.map((r) => ({ device: r.device || "Unknown", count: r.count })),
      browserStats: browserResult.map((r) => ({ browser: r.browser || "Unknown", count: r.count }))
    };
  }
};
var storage = new DatabaseStorage();

// routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      await storage.createNotification({
        title: "New Contact Form Submission",
        message: `${contact.name} submitted a contact form about "${contact.subject}"`,
        type: "info"
      });
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid contact data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to submit contact form" });
      }
    }
  });
  app2.get("/api/contacts", async (req, res) => {
    try {
      const contacts2 = await storage.getContacts();
      res.json(contacts2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      await storage.createInventoryMovement({
        productId: product.id,
        movementType: "in",
        quantity: product.stockQuantity,
        reason: "Initial stock",
        referenceId: `initial-${product.id}`
      });
      res.json({ success: true, product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updateData = req.body;
      if (updateData.stockQuantity !== void 0) {
        const currentProduct = await storage.getProduct(productId);
        if (currentProduct) {
          const quantityDiff = updateData.stockQuantity - currentProduct.stockQuantity;
          if (quantityDiff !== 0) {
            await storage.createInventoryMovement({
              productId,
              movementType: quantityDiff > 0 ? "in" : "out",
              quantity: Math.abs(quantityDiff),
              reason: "Manual adjustment",
              referenceId: `adjustment-${Date.now()}`
            });
          }
        }
      }
      const product = await storage.updateProduct(productId, updateData);
      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    try {
      const cartData = insertCartSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartData);
      res.json({ success: true, cartItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid cart data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add to cart" });
      }
    }
  });
  app2.put("/api/cart/:id", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(cartId, quantity);
      res.json({ success: true, cartItem });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      await storage.removeFromCart(cartId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const orderItems2 = await storage.getOrderItems(orderId);
      res.json({ ...order, items: orderItems2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderInfo } = req.body;
      const orderData = insertOrderSchema.parse(orderInfo);
      const order = await storage.createOrder(orderInfo);
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        });
        const product = await storage.getProduct(item.productId);
        if (product) {
          const newStock = product.stockQuantity - item.quantity;
          await storage.updateProductStock(item.productId, newStock);
          await storage.createInventoryMovement({
            productId: item.productId,
            movementType: "out",
            quantity: item.quantity,
            reason: "Order sale",
            referenceId: `order-${order.id}`
          });
        }
      }
      res.json({ success: true, order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid order data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  });
  app2.put("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(orderId, status);
      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId) : void 0;
      const movements = await storage.getInventoryMovements(productId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory movements" });
    }
  });
  app2.get("/api/showcase-images", async (req, res) => {
    try {
      const images = await storage.getShowcaseImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch showcase images" });
    }
  });
  app2.get("/api/showcase-images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await storage.getShowcaseImage(imageId);
      if (!image) {
        return res.status(404).json({ error: "Showcase image not found" });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch showcase image" });
    }
  });
  app2.post("/api/showcase-images", async (req, res) => {
    try {
      const imageData = insertShowcaseImageSchema.parse(req.body);
      const image = await storage.createShowcaseImage(imageData);
      res.json({ success: true, image });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid image data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create showcase image" });
      }
    }
  });
  app2.put("/api/showcase-images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const updateData = insertShowcaseImageSchema.partial().parse(req.body);
      const image = await storage.updateShowcaseImage(imageId, updateData);
      res.json({ success: true, image });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid image data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update showcase image" });
      }
    }
  });
  app2.delete("/api/showcase-images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      await storage.deleteShowcaseImage(imageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete showcase image" });
    }
  });
  app2.get("/api/messages", async (req, res) => {
    try {
      const contactId = req.query.contactId ? parseInt(req.query.contactId) : void 0;
      const messages2 = await storage.getMessages(contactId);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });
  app2.put("/api/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(messageId);
      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });
  app2.get("/api/contacts/:id/messages", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contactWithMessages = await storage.getContactWithMessages(contactId);
      if (!contactWithMessages) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contactWithMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      const notifications2 = await storage.getNotifications();
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json({ success: true, notification });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid notification data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create notification" });
      }
    }
  });
  app2.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json({ success: true, notification });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });
  app2.put("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSetting(req.params.key, value);
      res.json({ success: true, setting });
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });
  app2.post("/api/visitors", async (req, res) => {
    try {
      const visitorData = {
        sessionId: req.body.sessionId || "session_" + Date.now(),
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referer"),
        country: req.body.country,
        city: req.body.city,
        device: req.body.device,
        browser: req.body.browser,
        os: req.body.os,
        visitedPages: req.body.visitedPages || [],
        timeOnSite: req.body.timeOnSite,
        isReturning: req.body.isReturning || false
      };
      const visitor = await storage.createVisitor(visitorData);
      res.json({ success: true, visitor });
    } catch (error) {
      res.status(500).json({ error: "Failed to create visitor record" });
    }
  });
  app2.get("/api/visitors", async (req, res) => {
    try {
      const visitors2 = await storage.getVisitors();
      res.json(visitors2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitors" });
    }
  });
  app2.post("/api/page-views", async (req, res) => {
    try {
      const pageView = await storage.createPageView(req.body);
      res.json({ success: true, pageView });
    } catch (error) {
      res.status(500).json({ error: "Failed to create page view record" });
    }
  });
  app2.get("/api/analytics-data", async (req, res) => {
    try {
      const analyticsData = await storage.getAnalyticsData();
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// vite.ts
import express from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// index.ts
var app = express2();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: false
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalJson = res.json;
  res.json = function(body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/api/health", async (_req, res) => {
  try {
    const result = await db.select().from(products).limit(1);
    res.json({ ok: true, result });
  } catch (error) {
    console.error("\u274C Health check failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("\u274C Global Error Handler:", err);
    res.status(status).json({ error: message });
  });
  const port = process.env.PORT || 5e3;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`\u2705 Server running on http://localhost:${port}`);
  });
})();
