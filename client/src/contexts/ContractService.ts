import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

// Contract ABIs
const CONTRACT_ABI = [
	{
		"inputs": [],
		"name": "claimEarnings",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_deadline",
				"type": "uint256"
			}
		],
		"name": "invest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdtTokenAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "selfProfit",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "referralProfit",
				"type": "uint256"
			}
		],
		"name": "EarningsClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Invested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "fromUser",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "toUser",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "level",
				"type": "uint256"
			}
		],
		"name": "ReferralIncomeDistributed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_referrer",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_nonce",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			}
		],
		"name": "register",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			}
		],
		"name": "Registered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "calculateSelfProfit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getProfitRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "isRegistered",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "referrer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "totalInvestment",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalWithdrawn",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxWithdrawalLimit",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastProfitClaimTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "registrationTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "pendingReferralRewards",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "referrals",
						"type": "address[]"
					}
				],
				"internalType": "struct HicaperaMLM.User",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "levelPercentages",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_DISTRIBUTION_DEPTH",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MINIMUM_INVESTMENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MONTH_IN_SECONDS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PRECISION_FACTOR",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "selfProfitRates",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "usdtToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalInvestment",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalWithdrawn",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxWithdrawalLimit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastProfitClaimTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "registrationTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingReferralRewards",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "YEAR_IN_SECONDS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Helper function to fetch contract instance
const fetchContract = (address: string, abi: any[], signer: ethers.Signer) => {
  return new ethers.Contract(address, abi, signer);
};

class ContractService {
  private contractAddress: string;
  private usdtAddress: string;
  private contract: ethers.Contract | null;
  private usdtContract: ethers.Contract | null;

  constructor() {
    this.contractAddress = '0x4B294b9bA852c78BC7C33Ec13C0825b23a83A244';
    this.usdtAddress = import.meta.env.VITE_USDT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    this.contract = null;
    this.usdtContract = null;
  }

  async getProvider(): Promise<{ provider: ethers.BrowserProvider, signer: ethers.Signer }> {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const signer = provider.getSigner();
    const signerInstance = await signer;
    return { provider, signer: signerInstance };
  }

  async initializeContracts() {
    try {
      const { signer } = await this.getProvider();
      
      this.contract = fetchContract(this.contractAddress, CONTRACT_ABI, signer);
      // this.usdtContract = fetchContract(this.usdtAddress, USDT_ABI, signer);
      
      return { contract: this.contract, usdtContract: this.usdtContract };
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  async registerUser(referrerAddress: string) {
    try {
      const { signer } = await this.getProvider();
      const account = await signer.getAddress();
      
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      // Create a dummy nonce and signature since the contract doesn't actually verify them
      // (The signature verification code in the contract is commented out)
      const nonce = ethers.randomBytes(32);
      // Create a properly formatted dummy signature as bytes
      const dummySignature = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

      // Execute transaction directly without signature request
      const tx = await this.contract!.register(referrerAddress, nonce, dummySignature, {
        gasLimit: BigInt(3000000) // Use a fixed gas limit to avoid estimation issues
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Handle the "could not coalesce" error specifically
      const errorMessage = error.message || '';
      if (errorMessage.includes('could not coalesce')) {
        return {
          success: false,
          error: 'Registration failed. Please try again with a valid referrer address.'
        };
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async investAmount(amount: number, deadline: string) {
    try {
      const { signer } = await this.getProvider();
      const account = await signer.getAddress();
      
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract || !this.usdtContract) {
        await this.initializeContracts();
      }

      // USDT has 6 decimals
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // First approve USDT spending
      const approveGas = await this.usdtContract!.approve.estimateGas(this.contractAddress, amountWei);
      
      const approveTx = await this.usdtContract!.approve(
        this.contractAddress, 
        amountWei, 
        {
          gasLimit: (approveGas * BigInt(120)) / BigInt(100)
        }
      );
      
      await approveTx.wait();

      // Then invest
      const investGas = await this.contract!.invest.estimateGas(amountWei, deadlineTimestamp);
      
      const tx = await this.contract!.invest(
        amountWei, 
        deadlineTimestamp, 
        {
          gasLimit: (investGas * BigInt(120)) / BigInt(100)
        }
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      console.error('Investment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async claimEarnings() {
    try {
      const { signer } = await this.getProvider();
      const account = await signer.getAddress();
      
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const gasEstimate = await this.contract!.claimEarnings.estimateGas();
      
      const tx = await this.contract!.claimEarnings({
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100)
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      console.error('Claim failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserInfo(userAddress: string | null = null) {
    try {
      if (!userAddress) {
        const { signer } = await this.getProvider();
        userAddress = await signer.getAddress();
      }
      
      if (!userAddress) {
        throw new Error('No address provided');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const userInfo = await this.contract!.getUserInfo(userAddress);
      return {
        success: true,
        data: userInfo
      };
    } catch (error: any) {
      console.error('Failed to get user info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async calculateSelfProfit(userAddress: string | null = null) {
    try {
      if (!userAddress) {
        const { signer } = await this.getProvider();
        userAddress = await signer.getAddress();
      }
      
      if (!userAddress) {
        throw new Error('No address provided');
      }

      if (!this.contract) {
        await this.initializeContracts();
      }

      const profit = await this.contract!.calculateSelfProfit(userAddress);
      return {
        success: true,
        data: profit
      };
    } catch (error: any) {
      console.error('Failed to calculate profit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUSDTBalance(userAddress: string | null = null) {
    try {
      if (!userAddress) {
        const { signer } = await this.getProvider();
        userAddress = await signer.getAddress();
      }
      
      if (!userAddress) {
        throw new Error('No address provided');
      }

      if (!this.usdtContract) {
        await this.initializeContracts();
      }

      const balance = await this.usdtContract!.balanceOf(userAddress);
      const balanceFormatted = ethers.formatUnits(balance, 6); // USDT has 6 decimals

      return {
        success: true,
        data: balanceFormatted
      };
    } catch (error: any) {
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