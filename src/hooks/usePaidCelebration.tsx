import { useState } from 'react';

export const usePaidCelebration = () => {
  const [showMessage, setShowMessage] = useState(false);

  const celebrate = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const CelebrationMessage = () => {
    if (!showMessage) return null;

    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-primary via-primary to-accent p-12 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-300 text-white text-center max-w-2xl mx-4 border-4 border-white/20">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-6xl font-bold mb-4 drop-shadow-lg">
            Félicitations ! 🎊
          </h2>
          <p className="text-4xl font-semibold leading-relaxed drop-shadow-md">
            Querox vous félicite pour cette vente
          </p>
          <div className="mt-6 flex justify-center gap-3 text-5xl animate-pulse">
            ✨ 💪 ✨
          </div>
        </div>
      </div>
    );
  };

  return { celebrate, CelebrationMessage };
};
