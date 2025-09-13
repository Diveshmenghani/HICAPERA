import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '../services/web3.js';

interface UseWeb3Return {
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  formatAddress: (address: string) => string;
  isValidAddress: (address: string) => boolean;
}

export function useWeb3(): UseWeb3Return {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      const connected = await web3Service.checkConnection();
      if (connected) {
        setAccount(web3Service.getAccount());
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Check connection failed:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await web3Service.connectWallet();
      
      if (result.success) {
        setAccount(result.account);
        setIsConnected(true);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    web3Service.disconnect();
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnect,
    formatAddress: web3Service.formatAddress,
    isValidAddress: web3Service.isValidAddress
  };
}
