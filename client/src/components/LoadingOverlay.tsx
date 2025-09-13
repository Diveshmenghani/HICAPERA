import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subtitle?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Processing Transaction...", 
  subtitle = "Please confirm in your wallet" 
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="loading-overlay"
        >
          <motion.div
            className="glass-card rounded-2xl p-8 text-center max-w-sm mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="animate-spin w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2" data-testid="loading-message">
              {message}
            </p>
            <p className="text-sm text-muted-foreground" data-testid="loading-subtitle">
              {subtitle}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
