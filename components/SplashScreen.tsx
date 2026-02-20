import React from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-sans">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-[#FFD700]/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-[#FFD700] rounded-full border-t-transparent animate-spin"></div>
        <Sparkles className="absolute inset-0 m-auto text-[#FFD700] animate-pulse" size={32} />
      </div>
      <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">
        MY <span className="text-[#FFD700]">FOLIO</span>-TAG
      </h1>
      <p className="text-xs text-gray-500 uppercase tracking-widest">L'Arène des Créatifs Congolais</p>
    </div>
  );
};

export default SplashScreen;
