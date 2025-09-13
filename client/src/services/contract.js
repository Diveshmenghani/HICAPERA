import { web3Service } from './web3.js';

// Contract ABI - In production, this should be imported from a separate file
const CONTRACT_ABI = [
  {
    "inputs": [{"name": "_referrer", "type": "address"}, {"name": "_nonce", "type": "bytes32"}, {"name": "_signature", "type": "bytes"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_amount", "type": "uint256"}, {"name": "_deadline", "type": "uint256"}],
    "name": "invest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimEarnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [{
      "components": [
        {"name": "isRegistered", "type": "bool"},
        {"name": "referrer", "type": "address"},
        {"name": "totalInvestment", "type": "uint256"},
        {"name": "totalWithdrawn", "type": "uint256"},
        {"name": "maxWithdrawalLimit", "type": "uint256"},
        {"name": "lastProfitClaimTimestamp", "type": "uint256"},
        {"name": "registrationTimestamp", "type": "uint256"},
        {"name": "pendingReferralRewards", "type": "uint256"},
        {"name": "referrals", "type": "address[]"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "calculateSelfProfit",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDT_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class ContractService {
  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';
    this.usdtAddress = import.meta.env.VITE_USDT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    this.contract = null;
    this.usdtContract = null;
  }

  async initializeContracts() {
    const web3 = web3Service.getWeb3();
    if (!web3) {
      throw new Error('Web3 not initialized');
    }

    this.contract = new web3.eth.Contract(CONTRACT_ABI, this.contractAddress);
    this.usdtContract = new web3.eth.Contract(USDT_ABI, this.usdtAddress);
  }

  async registerUser(referrerAddress) {
    try {
      const account = web3Service.getAccount();
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      // Generate nonce and signature (simplified - in production, referrer should sign)
      const web3 = web3Service.getWeb3();
      const nonce = web3.utils.randomHex(32);
      const message = web3.utils.soliditySha3(account, nonce);
      const signature = await web3.eth.personal.sign(message, account);

      const gasEstimate = await this.contract.methods
        .register(referrerAddress, nonce, signature)
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .register(referrerAddress, nonce, signature)
        .send({ 
          from: account,
          gas: Math.floor(gasEstimate * 1.2)
        });

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async investAmount(amount, deadline) {
    try {
      const account = web3Service.getAccount();
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract || !this.usdtContract) {
        await this.initializeContracts();
      }

      const web3 = web3Service.getWeb3();
      const amountWei = web3.utils.toWei(amount.toString(), 'mwei'); // USDT has 6 decimals
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // First approve USDT spending
      const approveGas = await this.usdtContract.methods
        .approve(this.contractAddress, amountWei)
        .estimateGas({ from: account });

      await this.usdtContract.methods
        .approve(this.contractAddress, amountWei)
        .send({ 
          from: account,
          gas: Math.floor(approveGas * 1.2)
        });

      // Then invest
      const investGas = await this.contract.methods
        .invest(amountWei, deadlineTimestamp)
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .invest(amountWei, deadlineTimestamp)
        .send({ 
          from: account,
          gas: Math.floor(investGas * 1.2)
        });

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Investment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async claimEarnings() {
    try {
      const account = web3Service.getAccount();
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const gasEstimate = await this.contract.methods
        .claimEarnings()
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .claimEarnings()
        .send({ 
          from: account,
          gas: Math.floor(gasEstimate * 1.2)
        });

      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Claim failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserInfo(userAddress = null) {
    try {
      const address = userAddress || web3Service.getAccount();
      if (!address) {
        throw new Error('No address provided');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const userInfo = await this.contract.methods.getUserInfo(address).call();
      return {
        success: true,
        data: userInfo
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async calculateSelfProfit(userAddress = null) {
    try {
      const address = userAddress || web3Service.getAccount();
      if (!address) {
        throw new Error('No address provided');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const profit = await this.contract.methods.calculateSelfProfit(address).call();
      return {
        success: true,
        data: profit
      };
    } catch (error) {
      console.error('Failed to calculate profit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUSDTBalance(userAddress = null) {
    try {
      const address = userAddress || web3Service.getAccount();
      if (!address) {
        throw new Error('No address provided');
      }

      if (!this.usdtContract) {
        await this.initializeContracts();
      }

      const balance = await this.usdtContract.methods.balanceOf(address).call();
      const web3 = web3Service.getWeb3();
      const balanceFormatted = web3.utils.fromWei(balance, 'mwei'); // USDT has 6 decimals

      return {
        success: true,
        data: balanceFormatted
      };
    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      return {
        success: false,
        error: error.message,
        data: '0'
      };
    }
  }
}

export const contractService = new ContractService();
