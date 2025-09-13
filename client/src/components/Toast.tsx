import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export default function Toast({ isVisible, type, title, message, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  const colors = {
    success: 'bg-secondary/20 text-secondary',
    error: 'bg-destructive/20 text-destructive',
    warning: 'bg-accent/20 text-accent',
    info: 'bg-primary/20 text-primary',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 glass-card rounded-lg p-4 max-w-sm"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          data-testid="toast"
        >
          <div className="flex items-start space-x-3">
            <div className={`rounded-full p-1 ${colors[type]}`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <p className="font-semibold" data-testid="toast-title">
                {title}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="toast-message">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
