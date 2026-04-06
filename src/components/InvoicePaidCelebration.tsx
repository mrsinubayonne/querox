import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useContext } from 'react';

// Import the context directly to avoid the throwing hook
const AuthCtx = await import('@/contexts/AuthContext').then(m => m.AuthContext ?? m.default);

export const InvoicePaidCelebration = () => {
  const auth = useContext(AuthCtx);
  const user = auth?.user ?? null;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('invoice-paid-celebration')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Vérifier si le statut est passé à "paid"
          if (payload.new?.status === 'paid' && payload.old?.status !== 'paid') {
            setShow(true);
            setTimeout(() => setShow(false), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="celebration-overlay animate-fade-in">
        <div className="celebration-content bg-gradient-to-br from-primary via-primary-glow to-accent p-8 rounded-2xl shadow-2xl animate-scale-in text-white text-center max-w-md mx-4">
          <div className="celebration-icon text-6xl mb-4 animate-bounce">
            🎉
          </div>
          <h2 className="text-3xl font-bold mb-2 animate-pulse">
            Waouh ! 🎊
          </h2>
          <p className="text-xl font-semibold leading-relaxed">
            QUEROX est si fier de vous pour votre vente, Bravo ! 💪✨
          </p>
        </div>
      </div>
      
      <style>{`
        .celebration-overlay {
          animation: celebrationPulse 5s ease-in-out;
        }
        
        @keyframes celebrationPulse {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          10%, 90% { opacity: 1; transform: scale(1); }
        }
        
        .celebration-icon {
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
        }
      `}</style>
    </div>
  );
};
