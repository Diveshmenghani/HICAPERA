import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '../hooks/useWeb3';

export default function Navigation() {
  const { account, isConnected, isLoading, connectWallet, error } = useWeb3();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 glass-card"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-2xl font-bold glitch-text cursor-pointer" 
              data-text="HicaperaMLM"
              onClick={() => scrollToSection('hero')}
              whileHover={{ scale: 1.05 }}
              data-testid="logo"
            >
              HicaperaMLM
            </motion.h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse-neon">
              BETA
            </span>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {['dashboard', 'invest', 'earnings', 'referrals'].map((section) => (
                <motion.button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="hover:text-primary transition-colors capitalize"
                  whileHover={{ scale: 1.05 }}
                  data-testid={`nav-${section}`}
                >
                  {section}
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="neon-border animate-pulse-neon hover:bg-primary/10"
            data-testid="connect-wallet-btn"
          >
            {isLoading ? (
              'Connecting...'
            ) : isConnected ? (
              account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connected'
            ) : (
              'Connect Wallet'
            )}
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
