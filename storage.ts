import { 
  users, contacts, products, orders, orderItems, cart, inventory, showcaseImages, messages, notifications, settings, visitors, pageViews,
  type User, type InsertUser, type Contact, type InsertContact,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type CartItem, type InsertCart,
  type Inventory, type InsertInventory, type ShowcaseImage, type InsertShowcaseImage,
  type Message, type InsertMessage, type Notification, type InsertNotification,
  type Setting, type InsertSetting, type Visitor, type InsertVisitor,
  type PageView, type InsertPageView
} from "./shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact management
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Product management
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Order management
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart management
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCart): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Inventory management
  getInventoryMovements(productId?: number): Promise<Inventory[]>;
  createInventoryMovement(movement: InsertInventory): Promise<Inventory>;
  updateProductStock(productId: number, quantity: number): Promise<void>;
  
  // Showcase image management
  getShowcaseImages(): Promise<ShowcaseImage[]>;
  getShowcaseImage(id: number): Promise<ShowcaseImage | undefined>;
  createShowcaseImage(image: InsertShowcaseImage): Promise<ShowcaseImage>;
  updateShowcaseImage(id: number, image: Partial<InsertShowcaseImage>): Promise<ShowcaseImage>;
  deleteShowcaseImage(id: number): Promise<void>;
  
  // Messaging system
  getMessages(contactId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
  getContactWithMessages(contactId: number): Promise<Contact & { messages: Message[] } | undefined>;
  
  // Notifications
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  
  // Settings
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Visitor Analytics
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  getVisitors(): Promise<Visitor[]>;
  updateVisitor(id: number, data: Partial<InsertVisitor>): Promise<Visitor>;
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViews(visitorId?: number): Promise<PageView[]>;
  getAnalyticsData(): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    avgTimeOnSite: number;
    topPages: Array<{page: string; views: number}>;
    visitorsByCountry: Array<{country: string; count: number}>;
    deviceStats: Array<{device: string; count: number}>;
    browserStats: Array<{browser: string; count: number}>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Contact management
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    const contactList = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
    return contactList;
  }

  // Product management
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db
      .insert(products)
      .values(insertProduct as any)
      .returning();
    return result[0];
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product> {
    const result = await db
      .update(products)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      // Delete related order items
      await db.delete(orderItems).where(eq(orderItems.productId, id));
      // Delete related cart items
      await db.delete(cart).where(eq(cart.productId, id));
      // Delete related inventory records
      await db.delete(inventory).where(eq(inventory.productId, id));
      // Then delete the product
      await db.delete(products).where(eq(products.id, id));
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  }

  // Order management
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  // Cart management
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cart).where(eq(cart.sessionId, sessionId));
  }

  async addToCart(insertCart: InsertCart): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.sessionId, insertCart.sessionId), eq(cart.productId, insertCart.productId)));

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cart)
        .set({ quantity: existingItem.quantity + insertCart.quantity })
        .where(eq(cart.id, existingItem.id))
        .returning();
      return updated;
    } else {
      // Add new item
      const [cartItem] = await db
        .insert(cart)
        .values(insertCart)
        .returning();
      return cartItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [cartItem] = await db
      .update(cart)
      .set({ quantity })
      .where(eq(cart.id, id))
      .returning();
    return cartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cart).where(eq(cart.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cart).where(eq(cart.sessionId, sessionId));
  }

  // Inventory management
  async getInventoryMovements(productId?: number): Promise<Inventory[]> {
    if (productId) {
      return await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId))
        .orderBy(desc(inventory.createdAt));
    }
    return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  }

  async createInventoryMovement(insertInventory: InsertInventory): Promise<Inventory> {
    const [movement] = await db
      .insert(inventory)
      .values(insertInventory)
      .returning();
    return movement;
  }

  async updateProductStock(productId: number, quantity: number): Promise<void> {
    await db
      .update(products)
      .set({ stockQuantity: quantity, updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  // Showcase image management
  async getShowcaseImages(): Promise<ShowcaseImage[]> {
    return await db
      .select()
      .from(showcaseImages)
      .orderBy(showcaseImages.order, desc(showcaseImages.createdAt));
  }

  async getShowcaseImage(id: number): Promise<ShowcaseImage | undefined> {
    const [image] = await db
      .select()
      .from(showcaseImages)
      .where(eq(showcaseImages.id, id));
    return image;
  }

  async createShowcaseImage(insertImage: InsertShowcaseImage): Promise<ShowcaseImage> {
    const [image] = await db
      .insert(showcaseImages)
      .values(insertImage)
      .returning();
    return image;
  }

  async updateShowcaseImage(id: number, updateData: Partial<InsertShowcaseImage>): Promise<ShowcaseImage> {
    const [image] = await db
      .update(showcaseImages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(showcaseImages.id, id))
      .returning();
    return image;
  }

  async deleteShowcaseImage(id: number): Promise<void> {
    await db.delete(showcaseImages).where(eq(showcaseImages.id, id));
  }

  // Messaging system
  async getMessages(contactId?: number): Promise<Message[]> {
    if (contactId) {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.contactId, contactId))
        .orderBy(desc(messages.createdAt));
    }
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async getContactWithMessages(contactId: number): Promise<Contact & { messages: Message[] } | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId));
    
    if (!contact) return undefined;

    const contactMessages = await this.getMessages(contactId);
    return { ...contact, messages: contactMessages };
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Settings
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [setting] = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      return setting;
    }
  }

  // Visitor Analytics implementation
  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const result = await db.insert(visitors)
      .values(insertVisitor)
      .returning();
    return result[0];
  }

  async getVisitors(): Promise<Visitor[]> {
    return await db.select().from(visitors).orderBy(desc(visitors.createdAt));
  }

  async updateVisitor(id: number, updateData: Partial<InsertVisitor>): Promise<Visitor> {
    const result = await db.update(visitors)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(visitors.id, id))
      .returning();
    return result[0];
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const result = await db.insert(pageViews)
      .values(insertPageView)
      .returning();
    return result[0];
  }

  async getPageViews(visitorId?: number): Promise<PageView[]> {
    if (visitorId) {
      return await db.select().from(pageViews)
        .where(eq(pageViews.visitorId, visitorId))
        .orderBy(desc(pageViews.timestamp));
    }
    return await db.select().from(pageViews).orderBy(desc(pageViews.timestamp));
  }

  async getAnalyticsData(): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    avgTimeOnSite: number;
    topPages: Array<{page: string; views: number}>;
    visitorsByCountry: Array<{country: string; count: number}>;
    deviceStats: Array<{device: string; count: number}>;
    browserStats: Array<{browser: string; count: number}>;
  }> {
    // Get total visitors
    const totalVisitorsResult = await db.select({ count: sql<number>`count(*)` }).from(visitors);
    const totalVisitors = totalVisitorsResult[0]?.count || 0;

    // Get unique visitors (non-returning)
    const uniqueVisitorsResult = await db.select({ count: sql<number>`count(*)` })
      .from(visitors)
      .where(eq(visitors.isReturning, false));
    const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

    // Get total page views
    const pageViewsResult = await db.select({ count: sql<number>`count(*)` }).from(pageViews);
    const pageViewsCount = pageViewsResult[0]?.count || 0;

    // Get average time on site
    const avgTimeResult = await db.select({ avg: sql<number>`avg(time_on_site)` })
      .from(visitors)
      .where(sql`time_on_site IS NOT NULL`);
    const avgTimeOnSite = Math.round(avgTimeResult[0]?.avg || 0);

    // Get top pages
    const topPagesResult = await db.select({
      page: pageViews.page,
      views: sql<number>`count(*)`
    })
    .from(pageViews)
    .groupBy(pageViews.page)
    .orderBy(sql`count(*) desc`)
    .limit(10);

    // Get visitors by country
    const countryResult = await db.select({
      country: visitors.country,
      count: sql<number>`count(*)`
    })
    .from(visitors)
    .where(sql`country IS NOT NULL`)
    .groupBy(visitors.country)
    .orderBy(sql`count(*) desc`)
    .limit(10);

    // Get device stats
    const deviceResult = await db.select({
      device: visitors.device,
      count: sql<number>`count(*)`
    })
    .from(visitors)
    .where(sql`device IS NOT NULL`)
    .groupBy(visitors.device)
    .orderBy(sql`count(*) desc`);

    // Get browser stats
    const browserResult = await db.select({
      browser: visitors.browser,
      count: sql<number>`count(*)`
    })
    .from(visitors)
    .where(sql`browser IS NOT NULL`)
    .groupBy(visitors.browser)
    .orderBy(sql`count(*) desc`);

    return {
      totalVisitors,
      uniqueVisitors,
      pageViews: pageViewsCount,
      avgTimeOnSite,
      topPages: topPagesResult.map(r => ({ page: r.page, views: r.views })),
      visitorsByCountry: countryResult.map(r => ({ country: r.country || 'Unknown', count: r.count })),
      deviceStats: deviceResult.map(r => ({ device: r.device || 'Unknown', count: r.count })),
      browserStats: browserResult.map(r => ({ browser: r.browser || 'Unknown', count: r.count }))
    };
  }
}

export const storage = new DatabaseStorage();
