import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StateContext } from '@/contexts/StateContext';

interface UserStats {
  totalInvestment: string;
  totalEarnings: string;
  referralCount: number;
  withdrawalLimit: string;
  withdrawalProgress: number;
}

export default function DashboardSection() {
  const { address, isConnected, getUserInfo, calculateSelfProfit } = useContext(StateContext) || {};
  const [userStats, setUserStats] = useState<UserStats>({
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
          getUserInfo?.(address),
          calculateSelfProfit?.(address)
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
            referralCount: userInfo.referrals?.length || 0,
            withdrawalLimit: maxWithdrawalLimit.toFixed(2),
            withdrawalProgress: maxWithdrawalLimit > 0 ? (totalWithdrawn / maxWithdrawalLimit) * 100 : 0,
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, [isConnected, address, getUserInfo, calculateSelfProfit]);

  const statsCards = [
    {
      title: 'Total Investment',
      value: `$${userStats.totalInvestment}`,
      change: '+0.00% today',
      testId: 'stat-total-investment'
    },
    {
      title: 'Total Earnings',
      value: `$${userStats.totalEarnings}`,
      change: '+0.00% this month',
      color: 'text-secondary',
      testId: 'stat-total-earnings'
    },
    {
      title: 'Referrals',
      value: userStats.referralCount.toString(),
      change: 'Active referrals',
      color: 'text-primary',
      testId: 'stat-referrals'
    },
    {
      title: 'Withdrawal Limit',
      value: `$${userStats.withdrawalLimit}`,
      change: '2x investment cap',
      testId: 'stat-withdrawal-limit'
    },
  ];

  return (
    <section id="dashboard" className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Dashboard
        </motion.h2>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card hover-tilt" data-testid={stat.testId}>
                <CardContent className="p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">{stat.title}</h3>
                  <p className={`text-3xl font-bold font-mono ${stat.color || ''}`}>
                    {stat.value}
                  </p>
                  <div className="text-xs text-secondary mt-1">{stat.change}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress and Profit Rate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Withdrawal Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Withdrawn</span>
                  <span data-testid="withdrawal-percentage">{userStats.withdrawalProgress.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={userStats.withdrawalProgress} 
                  className="h-3"
                  data-testid="withdrawal-progress"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span data-testid="withdrawal-withdrawn">$0</span>
                  <span data-testid="withdrawal-limit">${userStats.withdrawalLimit}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Profit Rate Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profitRates.map((rate, index) => (
                  <div key={rate.year} className="flex justify-between items-center">
                    <span className="text-sm">{rate.year}</span>
                    <span className={`text-sm font-mono px-2 py-1 rounded ${rate.color}`}>
                      {rate.rate}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
