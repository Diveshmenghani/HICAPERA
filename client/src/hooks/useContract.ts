import { useState, useCallback } from 'react';
import { contractService } from '../services/contract.js';

interface ContractResult {
  success: boolean;
  error?: string;
  transactionHash?: string;
  data?: any;
}

interface UseContractReturn {
  isLoading: boolean;
  error: string | null;
  registerUser: (referrerAddress: string) => Promise<ContractResult>;
  investAmount: (amount: number, deadline: string) => Promise<ContractResult>;
  claimEarnings: () => Promise<ContractResult>;
  getUserInfo: (userAddress?: string | null) => Promise<ContractResult>;
  calculateSelfProfit: (userAddress?: string | null) => Promise<ContractResult>;
  getUSDTBalance: (userAddress?: string | null) => Promise<ContractResult>;
}

export function useContract(): UseContractReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerUser = useCallback(async (referrerAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.registerUser(referrerAddress);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const investAmount = useCallback(async (amount, deadline) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.investAmount(amount, deadline);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimEarnings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.claimEarnings();
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserInfo = useCallback(async (userAddress = null) => {
    try {
      const result = await contractService.getUserInfo(userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const calculateSelfProfit = useCallback(async (userAddress = null) => {
    try {
      const result = await contractService.calculateSelfProfit(userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const getUSDTBalance = useCallback(async (userAddress = null) => {
    try {
      const result = await contractService.getUSDTBalance(userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message, data: '0' };
    }
  }, []);

  return {
    isLoading,
    error,
    registerUser,
    investAmount,
    claimEarnings,
    getUserInfo,
    calculateSelfProfit,
    getUSDTBalance
  };
}
