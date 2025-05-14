const { pgTable, serial, text, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");


// Define 'users' table
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  otp: varchar("otp", { length: 6 }).notNull(),
  otpExpiresAt: timestamp("otp_expires_at", { withTimezone: true }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define 'items' table with foreign key to 'users'
const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  quantity: integer("quantity").default(0),
  price: integer("price"),
  description: text("description"),
  status: text("status").default("Available"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

module.exports = { users, items };
