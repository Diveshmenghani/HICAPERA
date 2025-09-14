import React, { useContext, createContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Import the new services
import { contractService } from '@/contexts/ContractService';
import { useWalletContext } from './WalletContext';

interface StateContextType {
  address: string | null;
  accountBalance: string | null;
  loader: boolean;
  isConnected: boolean;
  isLoading: boolean;
  setloader: (loading: boolean) => void;
  connectWallet: () => Promise<string | null>;
  checkIfWalletConnected: () => Promise<string | null>;
  registerUser: (referrerAddress: string) => Promise<any>;
  investAmount: (amount: number, deadline: string) => Promise<any>;
  claimEarnings: () => Promise<any>;
  getUserInfo: (userAddress?: string | null) => Promise<any>;
  calculateSelfProfit: (userAddress?: string | null) => Promise<any>;
  getUSDTBalance: (userAddress?: string | null) => Promise<any>;
  shortenAddress: (address: string) => string;
  isValidAddress: (address: string) => boolean;
}

export const StateContext = createContext<StateContextType | null>(null);

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  // Use the wallet context for wallet-related functionality
  const {
    address,
    accountBalance,
    isConnected,
    isLoading: walletLoading,
    connectWallet: walletConnect,
    checkIfWalletConnected: checkWalletConnected,
    shortenAddress,
    isValidAddress
  } = useWalletContext();
  
  // State management for contract operations
  const [loader, setloader] = React.useState<boolean>(false);
  
  // Computed properties
  const isLoading = loader || walletLoading;

  const notifySuccess = (msg: string) => toast({
    title: "✅ Success",
    description: msg,
  });

  const notifyError = (msg: string) => toast({
    title: "❌ Error",
    description: msg,
    variant: "destructive",
  });

  // Functions
  const connectWallet = async () => {
    return await walletConnect();
  };

  const checkIfWalletConnected = async () => {
    return await checkWalletConnected();
  };

  // Contract interaction functions
  const registerUser = async (referrerAddress: string) => {
    try {
      setloader(true);
      notifySuccess("Processing registration...");
      
      if (!address) {
        await connectWallet();
      }
      
      const result = await contractService.registerUser(referrerAddress);
      
      setloader(false);
      
      if (result.success) {
        notifySuccess("Registration successful!");
      } else {
        notifyError(result.error || "Registration failed");
      }
      
      return result;
    } catch (error: any) {
      setloader(false);
      notifyError("Something went wrong. Please try again later.");
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const investAmount = async (amount: number, deadline: string) => {
    try {
      setloader(true);
      notifySuccess("Processing investment...");
      
      if (!address) {
        await connectWallet();
      }
      
      const result = await contractService.investAmount(amount, deadline);
      
      setloader(false);
      
      if (result.success) {
        notifySuccess("Investment successful!");
      } else {
        notifyError(result.error || "Investment failed");
      }
      
      return result;
    } catch (error: any) {
      setloader(false);
      notifyError("Something went wrong. Please try again later.");
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const claimEarnings = async () => {
    try {
      setloader(true);
      notifySuccess("Processing claim...");
      
      if (!address) {
        await connectWallet();
      }
      
      const result = await contractService.claimEarnings();
      
      setloader(false);
      
      if (result.success) {
        notifySuccess("Claim successful!");
      } else {
        notifyError(result.error || "Claim failed");
      }
      
      return result;
    } catch (error: any) {
      setloader(false);
      notifyError("Something went wrong. Please try again later.");
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const getUserInfo = async (userAddress: string | null = null) => {
    try {
      const result = await contractService.getUserInfo(userAddress || address);
      return result;
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const calculateSelfProfit = async (userAddress: string | null = null) => {
    try {
      const result = await contractService.calculateSelfProfit(userAddress || address);
      return result;
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const getUSDTBalance = async (userAddress: string | null = null) => {
    try {
      const result = await contractService.getUSDTBalance(userAddress || address);
      return result;
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message, data: '0' };
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        accountBalance,
        loader,
        isConnected,
        isLoading,
        setloader,
        connectWallet,
        checkIfWalletConnected,
        registerUser,
        investAmount,
        claimEarnings,
        getUserInfo,
        calculateSelfProfit,
        getUSDTBalance,
        shortenAddress,
        isValidAddress,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateContextProvider');
  }
  return context;
};