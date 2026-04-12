import { pgTable, serial, text, integer, varchar, timestamp, vector } from "drizzle-orm/pg-core";

// 1. Travelers & their AI Embeddings
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  // Assuming a 768-dimension vector (standard for many modern embedding models)
  embedding: vector("embedding", { dimensions: 768 }), 
});

// 2. Pre-seeded Properties (The Supply)
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(), // e.g., 'Lisbon'
  totalRooms: integer("total_rooms").notNull(),
  pricePerRoom: integer("price_per_room").notNull(),
});

// 3. The Pods (The Anchor)
export const pods = pgTable("pods", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  month: text("month").notNull(), // e.g., 'October 2026'
  status: varchar("status", { length: 20 }).default('PENDING').notNull(), // 'PENDING' or 'LOCKED'
  minOccupancy: integer("min_occupancy").notNull(),
});

// 4. The Joining Mechanism
export const podMembers = pgTable("pod_members", {
  id: serial("id").primaryKey(),
  podId: integer("pod_id").references(() => pods.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});