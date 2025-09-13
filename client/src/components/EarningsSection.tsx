import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { useToast } from '@/hooks/use-toast';

interface EarningsData {
  selfProfit: string;
  referralRewards: string;
  totalClaimable: string;
  currentRate: string;
  lastClaim: string;
  monthsPending: number;
  remainingLimit: string;
  progressWidth: number;
  referralProgressWidth: number;
  directReferrals: number;
  totalNetwork: number;
  thisMonth: string;
}

export default function EarningsSection() {
  const { account, isConnected } = useWeb3();
  const { claimEarnings, isLoading, getUserInfo, calculateSelfProfit } = useContract();
  const { toast } = useToast();
  
  const [earnings, setEarnings] = useState<EarningsData>({
    selfProfit: '0.00',
    referralRewards: '0.00',
    totalClaimable: '0.00',
    currentRate: '7% APY',
    lastClaim: 'Never',
    monthsPending: 0,
    remainingLimit: '0.00',
    progressWidth: 0,
    referralProgressWidth: 0,
    directReferrals: 0,
    totalNetwork: 0,
    thisMonth: '0.00',
  });

  const levelPercentages = [
    { level: 1, percentage: '6.00%', color: 'text-primary' },
    { level: 2, percentage: '4.00%', color: 'text-secondary' },
    { level: 3, percentage: '3.00%', color: '' },
    { level: 4, percentage: '2.00%', color: '' },
    { level: 5, percentage: '1.00%', color: '' },
    { level: '6-10', percentage: '0.75%', color: '' },
    { level: '11-15', percentage: '0.50%', color: '' },
    { level: '16-20', percentage: '0.25%', color: '' },
    { level: '21-30', percentage: '0.125%', color: '' },
  ];

  useEffect(() => {
    const loadEarningsData = async () => {
      if (!isConnected || !account) return;

      try {
        const [userInfoResult, profitResult] = await Promise.all([
          getUserInfo(account),
          calculateSelfProfit(account)
        ]);

        if (userInfoResult.success) {
          const userInfo = userInfoResult.data;
          const selfProfit = profitResult.success ? parseFloat(profitResult.data || '0') / 1e18 : 0;
          const pendingReferralRewards = parseFloat(userInfo.pendingReferralRewards || '0') / 1e18;
          const totalWithdrawn = parseFloat(userInfo.totalWithdrawn || '0') / 1e18;
          const maxWithdrawalLimit = parseFloat(userInfo.maxWithdrawalLimit || '0') / 1e18;
          const totalClaimable = selfProfit + pendingReferralRewards;
          const remainingLimit = maxWithdrawalLimit - totalWithdrawn;

          // Calculate months pending based on last claim
          const lastClaimTimestamp = parseInt(userInfo.lastProfitClaimTimestamp || '0') * 1000;
          const timeDiff = Date.now() - lastClaimTimestamp;
          const monthsPending = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000));

          setEarnings({
            selfProfit: selfProfit.toFixed(2),
            referralRewards: pendingReferralRewards.toFixed(2),
            totalClaimable: totalClaimable.toFixed(2),
            currentRate: '7% APY', // This should be calculated based on registration time
            lastClaim: lastClaimTimestamp > 0 ? new Date(lastClaimTimestamp).toLocaleDateString() : 'Never',
            monthsPending: Math.max(0, monthsPending),
            remainingLimit: remainingLimit.toFixed(2),
            progressWidth: selfProfit > 0 ? Math.min(50, (selfProfit / 100) * 100) : 0, // Mock calculation
            referralProgressWidth: pendingReferralRewards > 0 ? Math.min(75, (pendingReferralRewards / 50) * 100) : 0,
            directReferrals: userInfo.referrals?.length || 0,
            totalNetwork: userInfo.referrals?.length || 0, // This should include deeper levels
            thisMonth: '0.00', // This should be calculated from recent earnings
          });
        }
      } catch (error) {
        console.error('Failed to load earnings data:', error);
      }
    };

    loadEarningsData();
  }, [isConnected, account, getUserInfo, calculateSelfProfit]);

  const handleClaimEarnings = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(earnings.totalClaimable) <= 0) {
      toast({
        title: "No Earnings",
        description: "You don't have any earnings to claim",
        variant: "destructive",
      });
      return;
    }

    const result = await claimEarnings();
    
    if (result.success) {
      toast({
        title: "Earnings Claimed",
        description: `Successfully claimed $${earnings.totalClaimable} USDT`,
      });
      // Reload earnings data after successful claim
      setTimeout(() => {
        window.location.reload(); // Simple refresh for demo
      }, 2000);
    } else {
      toast({
        title: "Claim Failed",
        description: result.error || "An error occurred while claiming earnings",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="earnings" className="py-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Earnings Overview
        </motion.h2>

        {/* Earnings Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Self Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card hover-tilt" data-testid="card-self-profit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">Self Profit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold font-mono" data-testid="self-profit-amount">
                    ${earnings.selfProfit}
                  </p>
                  <p className="text-sm text-muted-foreground">Available to claim</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Rate</span>
                    <span className="font-mono" data-testid="current-rate">{earnings.currentRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Claim</span>
                    <span className="font-mono" data-testid="last-claim">{earnings.lastClaim}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Months Pending</span>
                    <span className="font-mono" data-testid="months-pending">{earnings.monthsPending}</span>
                  </div>
                </div>

                <Progress value={earnings.progressWidth} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Rewards Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card hover-tilt" data-testid="card-referral-rewards">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-secondary">Referral Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold font-mono" data-testid="referral-rewards-amount">
                    ${earnings.referralRewards}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending rewards</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Direct Referrals</span>
                    <span className="font-mono" data-testid="direct-referrals">{earnings.directReferrals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Network</span>
                    <span className="font-mono" data-testid="total-network">{earnings.totalNetwork}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-mono text-secondary" data-testid="this-month">${earnings.thisMonth}</span>
                  </div>
                </div>

                <Progress value={earnings.referralProgressWidth} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Claimable Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card hover-tilt neon-border" data-testid="card-total-claimable">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-accent">Total Claimable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-4xl font-bold font-mono" data-testid="total-claimable-amount">
                    ${earnings.totalClaimable}
                  </p>
                  <p className="text-sm text-muted-foreground">Ready to withdraw</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Remaining Limit</span>
                    <span className="font-mono" data-testid="remaining-limit">${earnings.remainingLimit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gas Fee</span>
                    <span className="font-mono">~$3.20</span>
                  </div>
                </div>

                <Button
                  onClick={handleClaimEarnings}
                  disabled={isLoading || !isConnected || parseFloat(earnings.totalClaimable) <= 0}
                  className="w-full neon-border hover:bg-accent/10 py-3 font-semibold"
                  data-testid="button-claim-earnings"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full mr-2" />
                      Claiming...
                    </>
                  ) : (
                    'Claim Earnings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Level Commission Structure */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Commission Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {levelPercentages.map((level, index) => (
                  <motion.div
                    key={level.level}
                    className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    data-testid={`level-${level.level}`}
                  >
                    <div className="text-xs text-muted-foreground">Level {level.level}</div>
                    <div className={`font-bold ${level.color || 'text-foreground'}`}>
                      {level.percentage}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
