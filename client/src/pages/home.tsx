import { useEffect, useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import RegistrationSection from '../components/RegistrationSection';
import DashboardSection from '../components/DashboardSection';
import InvestmentSection from '../components/InvestmentSection';
import EarningsSection from '../components/EarningsSection';
import ReferralSection from '../components/ReferralSection';
import Footer from '../components/Footer';
import LoadingOverlay from '../components/LoadingOverlay';
import Toast from '../components/Toast';

interface ToastState {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showToast = (type: ToastState['type'], title: string, message: string) => {
    setToast({
      isVisible: true,
      type,
      title,
      message,
    });

    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    // Initialize scroll-based animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <RegistrationSection />
        <DashboardSection />
        <InvestmentSection />
        <EarningsSection />
        <ReferralSection />
        <Footer />
      </div>

      <LoadingOverlay isVisible={isLoading} />
      
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
