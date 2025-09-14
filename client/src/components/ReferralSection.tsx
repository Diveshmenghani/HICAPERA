import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { StateContext } from '@/contexts/StateContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: string;
}

interface NetworkLevel {
  level: number;
  levelRange: string;
  members: number;
  commission: string;
  earnings: string;
  commissionRate: string;
  bgColor: string;
  textColor: string;
}

export default function ReferralSection() {
  const { address, isConnected } = useContext(StateContext) || {};
  const { toast } = useToast();
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarnings: '0',
  });

  const referralLink = address 
    ? `${window.location.origin}/ref/${address}`
    : 'https://hicaperamlm.com/ref/0x1234...';

  const networkLevels: NetworkLevel[] = [
    {
      level: 1,
      levelRange: 'Level 1',
      members: 0,
      commission: '6% commission',
      earnings: '$0',
      commissionRate: '6.00%',
      bgColor: 'bg-primary/20',
      textColor: 'text-primary'
    },
    {
      level: 2,
      levelRange: 'Level 2',
      members: 0,
      commission: '4% commission',
      earnings: '$0',
      commissionRate: '4.00%',
      bgColor: 'bg-secondary/20',
      textColor: 'text-secondary'
    },
    {
      level: 3,
      levelRange: 'Levels 3-30',
      members: 0,
      commission: 'Variable commission',
      earnings: '$0',
      commissionRate: '0.125-3%',
      bgColor: 'bg-accent/20',
      textColor: 'text-accent'
    }
  ];

  useEffect(() => {
    // In a real implementation, this would fetch referral data from the blockchain
    // For now, we'll use mock data
    setReferralStats({
      totalReferrals: 0,
      totalEarnings: '0',
    });
  }, [address]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="referrals" className="py-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Referral Network
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card hover-tilt">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="referralLink" className="block text-sm font-medium mb-2">
                    Share this link to earn commissions
                  </Label>
                  <div className="flex">
                    <Input
                      id="referralLink"
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 bg-input border-border font-mono text-sm rounded-r-none"
                      data-testid="referral-link-input"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="px-6 bg-primary text-primary-foreground rounded-l-none hover:bg-primary/80"
                      data-testid="copy-link-btn"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary" data-testid="total-referrals">
                      {referralStats.totalReferrals}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-secondary" data-testid="total-referral-earnings">
                      ${referralStats.totalEarnings}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Network Tree Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Network Tree</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkLevels.map((level, index) => (
                  <motion.div
                    key={level.level}
                    className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    data-testid={`network-level-${level.level}`}
                  >
                    <div className={`w-8 h-8 ${level.bgColor} ${level.textColor} rounded-full flex items-center justify-center text-sm font-bold`}>
                      {level.level === 3 ? '...' : level.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{level.levelRange}</span>
                        <span className="text-sm text-muted-foreground">
                          {level.members} members
                        </span>
                      </div>
                      <div className="text-sm text-secondary">{level.commission}</div>
                    </div>
                    <div className="text-lg font-bold">{level.earnings}</div>
                  </motion.div>
                ))}

                <motion.div 
                  className="mt-6 p-4 bg-primary/10 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h4 className="font-semibold text-primary mb-2">Pro Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your referral link on social media, blogs, or directly with friends to maximize your passive income potential.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
