import React, { useState, useContext, createContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { toast } from '@/hooks/use-toast';

interface WalletContextType {
  address: string | null;
  accountBalance: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  checkIfWalletConnected: () => Promise<string | null>;
  shortenAddress: (address: string) => string;
  isValidAddress: (address: string) => boolean;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  // State Variables
  const [address, setAddress] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Computed properties
  const isConnected = !!address;
  const isLoading = loading;

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
  const checkIfWalletConnected = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        notifyError("MetaMask not found. Please install MetaMask to continue.");
        return null;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const getBalance = await provider.getBalance(accounts[0]);
        const bal = ethers.formatEther(getBalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
    
    // Setup event listeners for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          checkIfWalletConnected();
        } else {
          setAddress(null);
          setAccountBalance(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (typeof window.ethereum === 'undefined') {
        notifyError("MetaMask not found. Please install MetaMask to continue.");
        setLoading(false);
        return null;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const getBalance = await provider.getBalance(accounts[0]);
        const bal = ethers.formatEther(getBalance);
        setAccountBalance(bal);
        notifySuccess("Wallet connected successfully!");
        setLoading(false);
        return accounts[0];
      } else {
        notifyError("No account found");
        setLoading(false);
        return null;
      }
    } catch (error: any) {
      console.log(error);
      notifyError(error.message || "Failed to connect wallet");
      setLoading(false);
      return null;
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setAccountBalance(null);
    notifySuccess("Wallet disconnected");
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isValidAddress = (address: string) => {
    return ethers.isAddress(address);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        accountBalance,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        checkIfWalletConnected,
        shortenAddress,
        isValidAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletContextProvider');
  }
  return context;
};