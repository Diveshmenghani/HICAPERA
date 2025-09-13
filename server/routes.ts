import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertInvestmentSchema, insertEarningSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user info by address
  app.get("/api/users/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const user = await storage.getUserByAddress(address);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByAddress(userData.address);
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }
      
      // Verify referrer exists if provided
      if (userData.referrerAddress) {
        const referrer = await storage.getUserByAddress(userData.referrerAddress);
        if (!referrer) {
          return res.status(400).json({ error: "Referrer not found" });
        }
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Record investment
  app.post("/api/investments", async (req, res) => {
    try {
      const investmentData = insertInvestmentSchema.parse(req.body);
      
      // Verify user exists
      const user = await storage.getUserByAddress(investmentData.userAddress);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const investment = await storage.createInvestment(investmentData);
      
      // Update user's total investment and withdrawal limit
      const newTotalInvestment = parseFloat(user.totalInvestment || '0') + parseFloat(investmentData.amount);
      const newMaxWithdrawalLimit = newTotalInvestment * 2;
      
      await storage.updateUser(user.address, {
        totalInvestment: newTotalInvestment.toString(),
        maxWithdrawalLimit: newMaxWithdrawalLimit.toString(),
      });
      
      res.json(investment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user investments
  app.get("/api/investments/:userAddress", async (req, res) => {
    try {
      const { userAddress } = req.params;
      const investments = await storage.getUserInvestments(userAddress);
      res.json(investments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record earning
  app.post("/api/earnings", async (req, res) => {
    try {
      const earningData = insertEarningSchema.parse(req.body);
      const earning = await storage.createEarning(earningData);
      res.json(earning);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user earnings
  app.get("/api/earnings/:userAddress", async (req, res) => {
    try {
      const { userAddress } = req.params;
      const earnings = await storage.getUserEarnings(userAddress);
      res.json(earnings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user referrals
  app.get("/api/referrals/:userAddress", async (req, res) => {
    try {
      const { userAddress } = req.params;
      const referrals = await storage.getUserReferrals(userAddress);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get referral tree
  app.get("/api/referrals/:userAddress/tree", async (req, res) => {
    try {
      const { userAddress } = req.params;
      const maxDepth = parseInt(req.query.maxDepth as string) || 30;
      const tree = await storage.getReferralTree(userAddress, maxDepth);
      res.json(tree);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
