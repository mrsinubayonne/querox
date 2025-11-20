import { useState } from 'react';
import confetti from 'canvas-confetti';

export const usePaidCelebration = () => {
  const [showMessage, setShowMessage] = useState(false);

  const celebrate = () => {
    // Lancer les confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confetti depuis la gauche
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
      
      // Confetti depuis la droite
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
    }, 250);

    // Afficher le message
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3500);
  };

  const CelebrationMessage = () => {
    if (!showMessage) return null;

    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-300 text-white text-center max-w-md mx-4 border-4 border-white/20">
          <div className="text-7xl mb-4 animate-bounce">
            🎉
          </div>
          <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">
            Félicitations ! 🎊
          </h2>
          <p className="text-2xl font-semibold leading-relaxed drop-shadow-md">
            Querox vous félicite pour cette vente
          </p>
          <div className="mt-4 flex justify-center gap-2 text-4xl animate-pulse">
            ✨ 💪 ✨
          </div>
        </div>
      </div>
    );
  };

  return { celebrate, CelebrationMessage };
};
