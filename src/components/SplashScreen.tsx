import React from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative">
        <div className="absolute -inset-8 bg-gold-500/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="text-4xl md:text-6xl font-bold tracking-tighter flex items-center gap-3 animate-fade-in">
          <span className="text-white">MY</span>
          <span className="text-gold-400">FOLIO-TAG</span>
          <div className="w-3 h-3 rounded-full bg-gold-500 shadow-glow animate-bounce"></div>
        </div>
      </div>
      
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gold-shine w-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        <p className="text-gold-400/60 text-xs font-mono tracking-[0.3em] uppercase flex items-center gap-2">
          <Sparkles size={12} className="animate-spin-slow" />
          Initialisation de l'Empire
        </p>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
