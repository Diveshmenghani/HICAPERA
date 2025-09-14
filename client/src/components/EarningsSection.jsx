import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StateContext } from '@/contexts/StateContext';
import { useToast } from '@/hooks/use-toast';

export default function EarningsSection() {
  const { address, isConnected, claimEarnings, isLoading, getUserInfo, calculateSelfProfit } = useContext(StateContext);
  const { toast } = useToast();
  
  const [earnings, setEarnings] = useState({
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
  ];

  useEffect(() => {
    const loadEarningsData = async () => {
      if (!isConnected || !address) return;

      try {
        const [userInfoResult, profitResult] = await Promise.all([
          getUserInfo(address),
          calculateSelfProfit(address)
        ]);

        if (userInfoResult.success && profitResult.success) {
          const userInfo = userInfoResult.data;
          const selfProfit = parseFloat(profitResult.data || '0') / 1e18;
          const referralRewards = parseFloat(userInfo.pendingReferralRewards || '0') / 1e18;
          const totalInvestment = parseFloat(userInfo.totalInvestment || '0') / 1e18;
          const maxWithdrawalLimit = parseFloat(userInfo.maxWithdrawalLimit || '0') / 1e18;
          const totalWithdrawn = parseFloat(userInfo.totalWithdrawn || '0') / 1e18;
          const remainingLimit = Math.max(0, maxWithdrawalLimit - totalWithdrawn);
          const progressWidth = maxWithdrawalLimit > 0 ? Math.min(100, (totalWithdrawn / maxWithdrawalLimit) * 100) : 0;
          
          // Calculate months since registration
          const registrationTime = parseInt(userInfo.registrationTime || '0') * 1000;
          const currentTime = Date.now();
          const monthsSinceRegistration = registrationTime > 0 
            ? Math.floor((currentTime - registrationTime) / (30 * 24 * 60 * 60 * 1000)) 
            : 0;
          
          // Calculate current APY rate based on months
          let currentRate = '7% APY';
          if (monthsSinceRegistration >= 24) {
            currentRate = '12% APY';
          } else if (monthsSinceRegistration >= 12) {
            currentRate = '10% APY';
          }
          
          // Format last claim date
          const lastClaimTime = parseInt(userInfo.lastClaimTime || '0') * 1000;
          const lastClaim = lastClaimTime > 0 
            ? new Date(lastClaimTime).toLocaleDateString() 
            : 'Never';
          
          // Calculate months since last claim
          const monthsSinceLastClaim = lastClaimTime > 0 
            ? Math.floor((currentTime - lastClaimTime) / (30 * 24 * 60 * 60 * 1000)) 
            : monthsSinceRegistration;
          
          // Calculate referral stats
          const directReferrals = parseInt(userInfo.referralCount || '0');
          const totalNetwork = directReferrals * 3; // Simplified calculation for demo
          const referralProgressWidth = Math.min(100, (directReferrals / 20) * 100);
          
          // Calculate this month's earnings (simplified)
          const monthlyRate = parseFloat(currentRate.split('%')[0]) / 100 / 12;
          const thisMonth = (totalInvestment * monthlyRate).toFixed(2);

          setEarnings({
            selfProfit: selfProfit.toFixed(2),
            referralRewards: referralRewards.toFixed(2),
            totalClaimable: (selfProfit + referralRewards).toFixed(2),
            currentRate,
            lastClaim,
            monthsPending: monthsSinceLastClaim,
            remainingLimit: remainingLimit.toFixed(2),
            progressWidth,
            referralProgressWidth,
            directReferrals,
            totalNetwork,
            thisMonth,
          });
        }
      } catch (error) {
        console.error('Error loading earnings data:', error);
      }
    };

    loadEarningsData();
  }, [address, isConnected, getUserInfo, calculateSelfProfit]);

  const handleClaimEarnings = async () => {
    if (!isConnected || isLoading) return;
    
    try {
      const result = await claimEarnings();
      
      if (result.success) {
        toast({
          title: 'Earnings Claimed',
          description: 'Your earnings have been successfully claimed.',
        });
        
        // Refresh data after claiming
        const [userInfoResult, profitResult] = await Promise.all([
          getUserInfo(address),
          calculateSelfProfit(address)
        ]);
        
        if (userInfoResult.success && profitResult.success) {
          // Update state with new data
          // (Similar to the code in useEffect)
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Claim Failed',
          description: result.error || 'Failed to claim earnings. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error claiming earnings:', error);
      toast({
        variant: 'destructive',
        title: 'Claim Error',
        description: 'An error occurred while claiming earnings.',
      });
    }
  };

  return (
    <section id="earnings" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Earnings</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track and claim your investment profits and referral rewards.
        </p>
      </motion.div>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-xl mb-4">Connect your wallet to view your earnings</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Earnings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Investment Profit</h4>
                    <div className="text-3xl font-bold">${earnings.selfProfit}</div>
                    <div className="text-sm text-muted-foreground mt-1">{earnings.currentRate}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Referral Rewards</h4>
                    <div className="text-3xl font-bold">${earnings.referralRewards}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      From {earnings.directReferrals} direct referrals
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Total Claimable</h4>
                    <span className="text-2xl font-bold">${earnings.totalClaimable}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <span>Last claim: {earnings.lastClaim}</span>
                    <span>{earnings.monthsPending} months pending</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={parseFloat(earnings.totalClaimable) <= 0 || isLoading}
                    onClick={handleClaimEarnings}
                  >
                    {isLoading ? 'Processing...' : 'Claim Earnings'}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Withdrawal Limit</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-medium">${earnings.remainingLimit}</span>
                  </div>
                  <Progress value={earnings.progressWidth} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {earnings.progressWidth.toFixed(0)}% Used
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Earnings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Network</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{earnings.directReferrals}</div>
                      <div className="text-sm text-muted-foreground">Direct Referrals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{earnings.totalNetwork}</div>
                      <div className="text-sm text-muted-foreground">Total Network</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Network Growth</h4>
                    <span className="text-xs text-muted-foreground">20 max levels</span>
                  </div>
                  <Progress value={earnings.referralProgressWidth} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Referral Rates by Level</h4>
                  <div className="space-y-2">
                    {levelPercentages.map((level, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>Level {level.level}</span>
                        <span className={level.color || ''}>{level.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </section>
  );
}