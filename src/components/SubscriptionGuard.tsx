import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Admins always have access
    if (isAdmin) {
      setIsActive(true);
      setIsChecking(false);
      return;
    }

    const checkSubscription = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking subscription:', error);
        setIsActive(false);
      } else {
        setIsActive(data?.is_active ?? false);
      }
      setIsChecking(false);
    };

    checkSubscription();
  }, [user, isAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-sara-coral-light rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-sara-coral" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Acesso inativo</h2>
          <p className="text-muted-foreground mb-6">
            Sua assinatura está inativa ou pendente. Assine para ter acesso completo à Sara.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-sara text-primary-foreground rounded-2xl shadow-glow"
            onClick={() => window.open('https://pay.cakto.com.br/6ax9ypc_790406', '_blank')}
          >
            Assinar agora <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
