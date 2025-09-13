import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  referrerAddress: text("referrer_address"),
  totalInvestment: decimal("total_investment", { precision: 18, scale: 6 }).default('0'),
  totalWithdrawn: decimal("total_withdrawn", { precision: 18, scale: 6 }).default('0'),
  maxWithdrawalLimit: decimal("max_withdrawal_limit", { precision: 18, scale: 6 }).default('0'),
  lastProfitClaimTimestamp: timestamp("last_profit_claim_timestamp"),
  registrationTimestamp: timestamp("registration_timestamp").defaultNow(),
  pendingReferralRewards: decimal("pending_referral_rewards", { precision: 18, scale: 6 }).default('0'),
  isRegistered: boolean("is_registered").default(false),
  referralCount: integer("referral_count").default(0),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  type: text("type").notNull(), // 'self_profit' | 'referral_reward'
  fromUserAddress: text("from_user_address"), // For referral rewards
  level: integer("level"), // Referral level
  transactionHash: text("transaction_hash"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerAddress: text("referrer_address").notNull(),
  referredAddress: text("referred_address").notNull(),
  level: integer("level").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  address: true,
  referrerAddress: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  userAddress: true,
  amount: true,
  transactionHash: true,
  blockNumber: true,
});

export const insertEarningSchema = createInsertSchema(earnings).pick({
  userAddress: true,
  amount: true,
  type: true,
  fromUserAddress: true,
  level: true,
  transactionHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
