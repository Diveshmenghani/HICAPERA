import { type User, type InsertUser, type Investment, type InsertInvestment, type Earning, type InsertEarning, type Referral } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(address: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(address: string, updates: Partial<User>): Promise<User>;
  
  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getUserInvestments(userAddress: string): Promise<Investment[]>;
  
  // Earnings operations
  createEarning(earning: InsertEarning): Promise<Earning>;
  getUserEarnings(userAddress: string): Promise<Earning[]>;
  
  // Referral operations
  getUserReferrals(referrerAddress: string): Promise<Referral[]>;
  getReferralTree(userAddress: string, maxDepth?: number): Promise<Referral[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private investments: Map<string, Investment>;
  private earnings: Map<string, Earning>;
  private referrals: Map<string, Referral>;

  constructor() {
    this.users = new Map();
    this.investments = new Map();
    this.earnings = new Map();
    this.referrals = new Map();
  }

  async getUser(address: string): Promise<User | undefined> {
    return this.users.get(address.toLowerCase());
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return this.users.get(address.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      address: insertUser.address.toLowerCase(),
      referrerAddress: insertUser.referrerAddress?.toLowerCase() || null,
      totalInvestment: '0',
      totalWithdrawn: '0',
      maxWithdrawalLimit: '0',
      lastProfitClaimTimestamp: now,
      registrationTimestamp: now,
      pendingReferralRewards: '0',
      isRegistered: true,
      referralCount: 0,
    };
    this.users.set(user.address, user);
    return user;
  }

  async updateUser(address: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(address.toLowerCase());
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    this.users.set(address.toLowerCase(), updatedUser);
    return updatedUser;
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const investment: Investment = {
      ...insertInvestment,
      id,
      userAddress: insertInvestment.userAddress.toLowerCase(),
      timestamp: new Date(),
      blockNumber: insertInvestment.blockNumber ?? null,
    };
    this.investments.set(id, investment);
    return investment;
  }

  async getUserInvestments(userAddress: string): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(
      inv => inv.userAddress === userAddress.toLowerCase()
    );
  }

  async createEarning(insertEarning: InsertEarning): Promise<Earning> {
    const id = randomUUID();
    const earning: Earning = {
      ...insertEarning,
      id,
      userAddress: insertEarning.userAddress.toLowerCase(),
      fromUserAddress: insertEarning.fromUserAddress?.toLowerCase() || null,
      timestamp: new Date(),
      transactionHash: insertEarning.transactionHash ?? null,
      level: insertEarning.level ?? null,
    };
    this.earnings.set(id, earning);
    return earning;
  }

  async getUserEarnings(userAddress: string): Promise<Earning[]> {
    return Array.from(this.earnings.values()).filter(
      earning => earning.userAddress === userAddress.toLowerCase()
    );
  }

  async getUserReferrals(referrerAddress: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      ref => ref.referrerAddress === referrerAddress.toLowerCase()
    );
  }

  async getReferralTree(userAddress: string, maxDepth: number = 30): Promise<Referral[]> {
    const tree: Referral[] = [];
    const visited = new Set<string>();
    
    const traverse = (address: string, currentDepth: number) => {
      if (currentDepth > maxDepth || visited.has(address)) return;
      visited.add(address);
      
      const directReferrals = Array.from(this.referrals.values()).filter(
        ref => ref.referrerAddress === address.toLowerCase()
      );
      
      tree.push(...directReferrals);
      
      directReferrals.forEach(ref => {
        traverse(ref.referredAddress, currentDepth + 1);
      });
    };
    
    traverse(userAddress.toLowerCase(), 1);
    return tree;
  }
}

export const storage = new MemStorage();
