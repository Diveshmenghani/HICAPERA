import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StateContext } from '@/contexts/StateContext';

export default function DashboardSection() {
  const { address, isConnected, getUserInfo, calculateSelfProfit } = useContext(StateContext);
  const [userStats, setUserStats] = useState({
    totalInvestment: '0.00',
    totalEarnings: '0.00',
    referralCount: 0,
    withdrawalLimit: '0.00',
    withdrawalProgress: 0,
  });

  const profitRates = [
    { year: 'Year 1', rate: '7%', color: 'bg-primary/20 text-primary' },
    { year: 'Year 2', rate: '10%', color: 'bg-secondary/20 text-secondary' },
    { year: 'Year 3+', rate: '12%', color: 'bg-accent/20 text-accent' },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      if (!isConnected || !address) return;

      try {
        const [userInfoResult, profitResult] = await Promise.all([
          getUserInfo(address),
          calculateSelfProfit(address)
        ]);

        if (userInfoResult.success) {
          const userInfo = userInfoResult.data;
          const totalInvestment = parseFloat(userInfo.totalInvestment || '0') / 1e18;
          const totalWithdrawn = parseFloat(userInfo.totalWithdrawn || '0') / 1e18;
          const maxWithdrawalLimit = parseFloat(userInfo.maxWithdrawalLimit || '0') / 1e18;
          const selfProfit = profitResult.success ? parseFloat(profitResult.data || '0') / 1e18 : 0;
          const pendingReferralRewards = parseFloat(userInfo.pendingReferralRewards || '0') / 1e18;

          setUserStats({
            totalInvestment: totalInvestment.toFixed(2),
            totalEarnings: (selfProfit + pendingReferralRewards).toFixed(2),
            referralCount: parseInt(userInfo.referralCount || '0'),
            withdrawalLimit: maxWithdrawalLimit.toFixed(2),
            withdrawalProgress: maxWithdrawalLimit > 0 ? Math.min(100, (totalWithdrawn / maxWithdrawalLimit) * 100) : 0,
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [address, isConnected, getUserInfo, calculateSelfProfit]);

  return (
    <section id="dashboard" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Dashboard</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your investments, earnings, and referrals in one place.
        </p>
      </motion.div>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-xl mb-4">Connect your wallet to view your dashboard</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${userStats.totalInvestment}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${userStats.totalEarnings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.referralCount}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawal Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-2xl font-bold">${userStats.withdrawalLimit}</div>
                  <Progress value={userStats.withdrawalProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">{userStats.withdrawalProgress.toFixed(0)}% Used</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <h3 className="text-xl font-bold mb-6 text-center">Annual Profit Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profitRates.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <div className={`h-2 ${item.color.split(' ')[0]}`} />
              <CardContent className="pt-6">
                <h4 className="font-bold">{item.year}</h4>
                <p className={`text-2xl font-bold mt-2 ${item.color.split(' ')[1]}`}>{item.rate}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {index === 0 && 'Starting rate for new investors'}
                  {index === 1 && 'Increased rate after 12 months'}
                  {index === 2 && 'Maximum rate after 24 months'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  );
}