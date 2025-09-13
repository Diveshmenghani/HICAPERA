import Web3 from 'web3';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        this.isConnected = true;
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            this.account = accounts[0];
          } else {
            this.disconnect();
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        return {
          success: true,
          account: this.account
        };
      } else {
        throw new Error('MetaMask not found. Please install MetaMask to continue.');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkConnection() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.web3 = new Web3(window.ethereum);
        const accounts = await this.web3.eth.getAccounts();
        
        if (accounts.length > 0) {
          this.account = accounts[0];
          this.isConnected = true;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Check connection failed:', error);
      return false;
    }
  }

  disconnect() {
    this.account = null;
    this.isConnected = false;
  }

  getAccount() {
    return this.account;
  }

  getWeb3() {
    return this.web3;
  }

  isWalletConnected() {
    return this.isConnected && this.account;
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }

  toWei(amount) {
    return this.web3?.utils.toWei(amount.toString(), 'ether');
  }

  fromWei(amount) {
    return this.web3?.utils.fromWei(amount.toString(), 'ether');
  }

  isValidAddress(address) {
    return this.web3?.utils.isAddress(address) || false;
  }
}

export const web3Service = new Web3Service();
