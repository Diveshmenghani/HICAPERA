import { toast } from '@/hooks/use-toast';

// Sepolia Test Network Configuration
const SEPOLIA_NETWORK = {
  chainId: `0x${Number(11155111).toString(16)}`,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'SETH',
    decimals: 18,
  },
  rpcUrls: ["https://rpc.ankr.com/eth_sepolia"],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

/**
 * Checks if the current network is supported
 * This function always returns true to allow transactions on any network
 * @returns {boolean} Always returns true
 */
export const isNetworkSupported = async (): Promise<boolean> => {
  return true;
};

/**
 * Gets the current chain ID from MetaMask
 * @returns {string} The current chain ID in hex format
 */
export const getCurrentChainId = async (): Promise<string | null> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask not found');
      return null;
    }
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Gets the network name based on chain ID
 * @param {string} chainId - The chain ID in hex format
 * @returns {string} The network name
 */
export const getNetworkName = (chainId: string): string => {
  const networks: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Mumbai Testnet',
    '0xa86a': 'Avalanche Mainnet',
    '0xa869': 'Avalanche Fuji Testnet',
    '0x38': 'BNB Smart Chain Mainnet',
    '0x61': 'BNB Smart Chain Testnet',
  };
  
  return networks[chainId] || 'Unknown Network';
};