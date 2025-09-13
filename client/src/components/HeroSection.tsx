import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="pt-32 pb-16 px-4 min-h-screen flex items-center justify-center relative">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="animate-float"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="glitch-text" data-text="DEFI">DEFI</span>
            <span className="text-primary ml-4">MLM</span>
          </h1>
        </motion.div>

        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Next-generation blockchain investment platform with multi-level referral rewards
        </motion.p>

        <motion.div 
          className="flex flex-col md:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Button
            onClick={() => scrollToSection('register')}
            className="neon-border hover:bg-primary/10 hover-tilt px-8 py-4 text-lg"
            data-testid="get-started-btn"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            onClick={() => scrollToSection('dashboard')}
            className="hover:bg-muted/50 hover-tilt px-8 py-4 text-lg"
            data-testid="learn-more-btn"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
