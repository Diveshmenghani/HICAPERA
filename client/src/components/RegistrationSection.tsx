import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { useToast } from '@/hooks/use-toast';

export default function RegistrationSection() {
  const [referrerAddress, setReferrerAddress] = useState('');
  const { account, isConnected, isValidAddress } = useWeb3();
  const { registerUser, isLoading } = useContract();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isConnected) {
        toast({
          title: "⚠️ Wallet Not Connected",
          description: "Please connect your MetaMask wallet first to continue",
          variant: "destructive",
        });
        return;
      }

      if (!referrerAddress || !referrerAddress.trim()) {
        toast({
          title: "❌ Missing Referrer Address",
          description: "Please enter a referrer address to register",
          variant: "destructive",
        });
        return;
      }

      if (!isValidAddress(referrerAddress)) {
        toast({
          title: "❌ Invalid Ethereum Address",
          description: "The referrer address must be a valid Ethereum address (0x...)",
          variant: "destructive",
        });
        return;
      }

      const result = await registerUser(referrerAddress);
      
      if (result.success) {
        toast({
          title: "🎉 Registration Successful!",
          description: "Welcome to HicaperaMLM! You can now start investing.",
        });
        setReferrerAddress('');
      } else {
        toast({
          title: "❌ Registration Failed",
          description: result.error || "Transaction failed. Please try again or check your wallet.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "💥 Unexpected Error",
        description: "Something went wrong. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="register" className="py-16 px-4 relative z-10">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card hover-tilt">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Register</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="referrerAddress" className="block text-sm font-medium mb-2">
                    Referrer Address
                  </Label>
                  <Input
                    id="referrerAddress"
                    type="text"
                    placeholder="0x..."
                    value={referrerAddress}
                    onChange={(e) => setReferrerAddress(e.target.value)}
                    className="bg-input border-border focus:ring-ring"
                    data-testid="input-referrer-address"
                  />
                </div>

                <div>
                  <Label htmlFor="userAddress" className="block text-sm font-medium mb-2">
                    Your Address
                  </Label>
                  <Input
                    id="userAddress"
                    type="text"
                    value={account || ''}
                    readOnly
                    placeholder="Connect wallet first"
                    className="bg-muted text-muted-foreground border-border"
                    data-testid="input-user-address"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="w-full neon-border hover:bg-primary/10 py-4 font-semibold"
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register Now'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
