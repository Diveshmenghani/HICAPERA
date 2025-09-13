import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { useToast } from '@/hooks/use-toast';

export default function InvestmentSection() {
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0.00');
  const { account, isConnected } = useWeb3();
  const { investAmount, isLoading, getUSDTBalance } = useContract();
  const { toast } = useToast();

  const benefits = [
    {
      title: 'Monthly Profits',
      description: 'Earn 7-12% annual returns paid monthly',
      icon: '✓',
      color: 'bg-primary/20 text-primary'
    },
    {
      title: 'Referral Rewards',
      description: 'Earn up to 6% from direct referrals',
      icon: '✓',
      color: 'bg-secondary/20 text-secondary'
    },
    {
      title: '30-Level Deep',
      description: 'Multi-level commission structure',
      icon: '✓',
      color: 'bg-accent/20 text-accent'
    },
    {
      title: '2x Withdrawal Cap',
      description: 'Withdraw up to 200% of investment',
      icon: '✓',
      color: 'bg-primary/20 text-primary'
    }
  ];

  useEffect(() => {
    // Set default deadline (1 hour from now)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setDeadline(now.toISOString().slice(0, 16));

    // Load USDT balance
    const loadBalance = async () => {
      if (isConnected && account) {
        const result = await getUSDTBalance(account);
        if (result.success) {
          setUsdtBalance(parseFloat(result.data).toFixed(2));
        }
      }
    };

    loadBalance();
  }, [isConnected, account, getUSDTBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isConnected) {
        toast({
          title: "⚠️ Wallet Not Connected",
          description: "Please connect your MetaMask wallet to invest",
          variant: "destructive",
        });
        return;
      }

      const investmentAmount = parseFloat(amount);
      if (isNaN(investmentAmount) || investmentAmount <= 0) {
        toast({
          title: "❌ Invalid Amount",
          description: "Please enter a valid investment amount",
          variant: "destructive",
        });
        return;
      }

      if (investmentAmount < 100) {
        toast({
          title: "💰 Minimum Investment Required",
          description: "Minimum investment is $100 USDT. Please increase your amount.",
          variant: "destructive",
        });
        return;
      }

      if (!deadline) {
        toast({
          title: "⏰ Missing Deadline",
          description: "Please set a transaction deadline for security",
          variant: "destructive",
        });
        return;
      }

      // Check if user has enough balance
      const currentBalance = parseFloat(usdtBalance);
      if (currentBalance < investmentAmount) {
        toast({
          title: "💸 Insufficient Balance",
          description: `You need $${investmentAmount} USDT but only have $${currentBalance} USDT`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "🔄 Processing Investment...",
        description: "Please confirm the transaction in your wallet",
      });

      const result = await investAmount(investmentAmount, deadline);
      
      if (result.success) {
        toast({
          title: "✅ Investment Successful!",
          description: `Successfully invested $${amount} USDT. Start earning profits now!`,
        });
        setAmount('');
        // Reload balance
        const balanceResult = await getUSDTBalance(account);
        if (balanceResult.success) {
          setUsdtBalance(parseFloat(balanceResult.data).toFixed(2));
        }
      } else {
        toast({
          title: "❌ Investment Failed",
          description: result.error || "Transaction failed. Please check your wallet and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Investment error:', error);
      toast({
        title: "💥 Investment Error",
        description: "Something went wrong with your investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="invest" className="py-16 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Make Investment
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Investment Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card hover-tilt">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Investment Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="investmentAmount" className="block text-sm font-medium mb-2">
                      Investment Amount (USDT)
                    </Label>
                    <div className="relative">
                      <Input
                        id="investmentAmount"
                        type="number"
                        placeholder="100.00"
                        min="100"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-input border-border focus:ring-ring pl-12"
                        data-testid="input-investment-amount"
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum investment: $100 USDT
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="transactionDeadline" className="block text-sm font-medium mb-2">
                      Transaction Deadline
                    </Label>
                    <Input
                      id="transactionDeadline"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-input border-border focus:ring-ring"
                      data-testid="input-transaction-deadline"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Your Balance</span>
                      <span className="font-mono" data-testid="usdt-balance">{usdtBalance} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transaction Fee</span>
                      <span className="font-mono">~$2.50</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isConnected}
                    className="w-full neon-border hover:bg-primary/10 py-4 font-semibold"
                    data-testid="button-invest"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full mr-2" />
                        Investing...
                      </>
                    ) : (
                      'Invest Now'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Investment Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Investment Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mt-1 ${benefit.color}`}>
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  className="mt-8 p-4 bg-muted/30 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h4 className="font-semibold mb-2">Profit Calculator</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>$1,000 investment</span>
                      <span className="font-mono text-primary">$5.83/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>After 1 year</span>
                      <span className="font-mono text-secondary">$1,070</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max withdrawal</span>
                      <span className="font-mono text-accent">$2,000</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
